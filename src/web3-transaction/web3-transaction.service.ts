import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { contract, network_support } from '@prisma/client';
import Axios from 'axios';
import { Contract, ethers, Event } from 'ethers';
import { find, isEmpty, map, pick } from 'lodash';
import { PrismaService } from 'nestjs-prisma';
import { BaseService } from 'src/_services/base.service';
import { CreateContractInput, GetEventByTxHash, CreateNetworkInput, GetEventAll } from './web3-transaction.dto';
import { transformEventByABI } from './web3-transaction.util';
@Injectable()
export class Web3TransactionService extends BaseService {
  constructor(private readonly configService: ConfigService, private readonly prismaService: PrismaService) {
    super();
  }

  private _transformArgsEvent(values: ethers.utils.Result, keys: any[]) {
    let args = {};

    if (values.length !== keys.length) return;
    keys.forEach((key, i) => {
      args[key] = values[i];
    });
    return args;
  }

  private _getProviderByContract(
    contractDetail: contract & {
      network_support: network_support;
    },
  ) {
    const provider =
      this.exportProviderViaURL(contractDetail.network_support.rpc_url) || this.exportProviderViaURL(contractDetail.network_support.rpc_url_backup);
    return provider;
  }

  async _getABIByContract(
    contractDetail: contract & {
      network_support: network_support;
    },
  ) {
    const { data } = await Axios.get(contractDetail.abi_url);

    const abi = data['abi'] || data;

    if (!abi) throw new BadRequestException('ABI not found!');

    return abi;
  }

  private _getRangeBlocks(startBlock, latestBlock, step: number = 5000): { startBlock: number; endBlock: number }[] {
    let rangeBlocks = new Array();
    while (startBlock < latestBlock) {
      if (startBlock + step < latestBlock) {
        rangeBlocks.push({
          startBlock: startBlock,
          endBlock: startBlock + step,
        });
      } else {
        rangeBlocks.push({
          startBlock: startBlock,
          endBlock: startBlock + step,
        });
      }
      startBlock += step + 1;
    }
    return rangeBlocks;
  }

  async getEventALl(input: GetEventAll, contractDetail: contract & { network_support: network_support }) {
    const abi = await this._getABIByContract(contractDetail);

    const provider = this._getProviderByContract(contractDetail);

    const contract = new Contract(contractDetail.address, abi, provider);

    let contractEvents = transformEventByABI(abi);

    let eventContractDetail = find(contractEvents, { name: input.eventName });
    if (!eventContractDetail) throw new BadRequestException('Event invalid');

    let eventFilter = contract.filters[`${eventContractDetail.name}`](null, null);

    let latestBlock = await provider.getBlockNumber();
    console.log(latestBlock);

    if (input.startBlock > latestBlock) throw new BadRequestException('start block invalid!');

    let startBlock = input.startBlock;

    let eventRaws: Event[] = [];

    let rangeBlocks = this._getRangeBlocks(startBlock, latestBlock);

    console.log(rangeBlocks);
  }

  async getEventByTxHash(
    getEventByTxHashInput: GetEventByTxHash,
    contractDetail: contract & {
      network_support: network_support;
    },
  ) {
    const abi = await this._getABIByContract(contractDetail);

    const provider = this._getProviderByContract(contractDetail);

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
        eventValue: this._transformArgsEvent(eventByTxHashRaw.args, eventContractDetail.params as String[]),
      })),
    );
  }

  exportProviderViaURL(providerUrl: string) {
    try {
      if (/^(https|http)/i.test(providerUrl)) {
        return new ethers.providers.JsonRpcProvider(providerUrl);
      }
      if (/^(wss|ws)/i.test(providerUrl)) {
        return new ethers.providers.WebSocketProvider(providerUrl);
      }
      return;
    } catch (error) {
      return;
    }
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
}
