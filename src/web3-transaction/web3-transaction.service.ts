import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { contract, network_support } from '@prisma/client';
import { Contract, Event, EventFilter } from 'ethers';
import _, { chunk, find, isEmpty, map, pick } from 'lodash';
import { PrismaService } from 'nestjs-prisma';
import { BaseService } from 'src/_services/base.service';
import { CreateContractInput, GetEventByTxHash, CreateNetworkInput, GetEventAll } from './web3-transaction.dto';
import { getABIByContract, getProviderByContract, getRangeBlocks, transformArgsEvent, transformEventByABI } from './web3-transaction.util';

@Injectable()
export class Web3TransactionService extends BaseService {
  constructor(private readonly configService: ConfigService, private readonly prismaService: PrismaService) {
    super();
  }

  async getEventAll(input: GetEventAll, contractDetail: contract & { network_support: network_support }) {
    return this.fetchCacheable(`${input.eventName}-${input.startBlock}`, async () => {
      const abi = await getABIByContract(contractDetail);

      const provider = getProviderByContract(contractDetail);

      const contract = new Contract(contractDetail.address, abi, provider);

      let contractEvents = transformEventByABI(abi);

      let eventContractDetail = find(contractEvents, { name: input.eventName });
      if (!eventContractDetail) throw new BadRequestException('Event invalid');

      let eventFilter = contract.filters[`${eventContractDetail.name}`](null, null);

      let latestBlock = await provider.getBlockNumber();

      if (input.startBlock > latestBlock) throw new BadRequestException('start block invalid!');

      let eventRaws: Event[] = [];

      let rangeBlocks = chunk(getRangeBlocks(input.startBlock, latestBlock), 10);

      for (let i of rangeBlocks) {
        let data = await this._getEventRange(contract, eventFilter, i);
        if (data.length !== 0) {
          eventRaws.push(...data);
        }
      }

      return eventRaws.map((event) => ({
        ...event,
        args: transformArgsEvent(event.args, eventContractDetail.params),
      }));
    });
  }

  async getEventByTxHash(
    getEventByTxHashInput: GetEventByTxHash,
    contractDetail: contract & {
      network_support: network_support;
    },
  ) {
    const abi = await getABIByContract(contractDetail);

    const provider = getProviderByContract(contractDetail);

    const contract = new Contract(contractDetail.address, abi, provider);

    let contractEvents = transformEventByABI(abi);

    let eventContractDetail = find(contractEvents, { name: getEventByTxHashInput.eventName });
    if (!eventContractDetail) throw new BadRequestException('Event invalid');

    let [eventFilter, transaction] = await Promise.all([
      /*
        Get eventFilter: https://docs.ethers.io/v5/concepts/events

        List all transaction via Event of Smart Contract *from* myAddress
      */
      contract.filters[`${eventContractDetail.name}`](getEventByTxHashInput.myAddress),
      provider.getTransaction(getEventByTxHashInput.txHash),
    ]);

    let eventByTxHashRaws = await contract.queryFilter(eventFilter, transaction.blockNumber, transaction.blockNumber + 4999);

    //TODO: get transaction over 50000 blocks

    if (!eventByTxHashRaws || isEmpty(eventByTxHashRaws)) return;

    return Promise.all(
      map(eventByTxHashRaws, async (eventByTxHashRaw) => ({
        ...pick(eventByTxHashRaw, ['event', 'blockNumber', 'blockHash', 'transactionHash']),
        ...pick(await eventByTxHashRaw.getTransactionReceipt(), ['from', 'to', 'status']),
        timestamp: (await eventByTxHashRaw.getBlock()).timestamp,
        eventValue: transformArgsEvent(eventByTxHashRaw.args, eventContractDetail.params as String[]),
      })),
    );
  }

  async findContractByAddress(contractAddress: string) {
    return this.prismaService.contract.findFirst({
      where: {
        address: contractAddress,
      },
      include: {
        network_support: true,
      },
    });
  }

  async findNetworkSupportById(id: number) {
    return this.prismaService.network_support.findFirst({
      where: {
        id: id,
      },
    });
  }

  createNetwork(payload: CreateNetworkInput) {
    return this.prismaService.network_support.create({
      data: {
        name: payload.networkName,
        chain_id: payload.chainId,
        type: payload.networkType,
        rpc_url: payload.rpcUrl,
        icon_network_url: payload.iconNetworkUrl,
        rpc_url_backup: payload.rpcUrlBackup,
        block_explorer_url: payload.blockExplorerUrl,
        currency_symbol: payload.currencySymbol,
      },
    });
  }

  createContract(payload: CreateContractInput) {
    return this.prismaService.contract.create({
      data: {
        abi_url: payload.abiUrl,
        address: payload.contractAddress,
        name: payload.contractName,
        network_support: {
          connect: { id: payload.networkSupportId },
        },
      },
    });
  }

  getListNetworkSupport() {
    return this.fetchCacheable('get-list-network-support', () => {
      return this.prismaService.network_support.findMany();
    });
  }

  getListContracts() {
    return this.fetchCacheable('get-list-contract', () => {
      return this.prismaService.contract.findMany({
        include: {
          network_support: true,
        },
      });
    });
  }

  getContractDetail(contractId: string) {
    return this.prismaService.contract.findUnique({
      where: {
        id: contractId,
      },
      include: {
        network_support: true,
      },
    });
  }

  updateContract() {
    //TODO: code here
  }

  updateNetwork() {
    //TODO: code here
  }

  async _getEventRange(contract: Contract, eventFilter: EventFilter, rangeBlocks: { startBlock: number; endBlock: number }[]) {
    let events: Event[] = [];

    for (let rangeBlock of rangeBlocks) {
      let rse = await contract.queryFilter(eventFilter, rangeBlock.startBlock, rangeBlock.endBlock);
      if (rse.length !== 0) {
        events.push(...rse);
      }
    }
    return events;
  }
}
