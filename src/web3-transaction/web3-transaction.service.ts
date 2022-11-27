import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { contract, event, network_support } from '@prisma/client';
import Axios from 'axios';
import { Contract, ethers } from 'ethers';
import { find, isEmpty, map, pick } from 'lodash';
import { PrismaService } from 'nestjs-prisma';
import { BaseService } from 'src/_services/base.service';
import { CreateContractInput, GetEventByTxHash, CreateNetworkInput } from './web3-transaction.dto';
@Injectable()
export class Web3TransactionService extends BaseService implements OnModuleInit {
  constructor(private readonly configService: ConfigService, private readonly prismaService: PrismaService) {
    super();
  }
  private provider: ethers.providers.JsonRpcProvider;
  onModuleInit() {
    this.provider = new ethers.providers.WebSocketProvider(this.configService.get('RPC_NETWORK_URL') as string);
  }

  private _transformArgsEvent(values: ethers.utils.Result, keys: any[]) {
    let args = {};

    if (values.length !== keys.length) return;
    keys.forEach((key, i) => {
      args[key] = values[i];
    });
    return args;
  }

  async getEventByTxHash(
    getEventByTxHashInput: GetEventByTxHash,
    contractDetail: contract & {
      event: event[];
      network_support: network_support;
    },
  ) {
    const abi = await Axios.get(contractDetail.abi_url);

    const contract = new Contract(contractDetail.address, abi.data, this.provider);

    let eventContractDetail = find(contractDetail.event, (e) => e.name === getEventByTxHashInput.eventName);
    if (!eventContractDetail) throw new BadRequestException('Event not exist');

    let [eventFilter, transaction] = await Promise.all([
      /*
        Get eventFilter: https://docs.ethers.io/v5/concepts/events

        List all transaction via Event of Smart Contract *from* myAddress
      */
      contract.filters[`${eventContractDetail.name}`](getEventByTxHashInput.myAddress),
      this.provider.getTransaction(getEventByTxHashInput.txHash),
    ]);

    let eventByTxHashRaws = await contract.queryFilter(eventFilter, transaction.blockNumber);

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

  async findContractByAddress(contractAddress: string) {
    return this.prismaService.contract.findFirst({
      where: {
        address: contractAddress,
      },
      include: {
        event: true,
        network_support: true,
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
        event: {
          createMany: {
            data: payload.events,
          },
        },
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
        event: true,
        method: true,
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
