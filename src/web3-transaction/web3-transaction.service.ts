import { PrismaService } from 'nestjs-prisma';
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, Contract } from 'ethers';
import Axios from 'axios';
import { BaseService } from 'src/_services/base.service';
import { GetEventByTxHash, CreateContractInput } from './web3-transaction.dto';
import { contract, event, Prisma } from '@prisma/client';
import { find, isEmpty, map, pick } from 'lodash';
@Injectable()
export class Web3TransactionService extends BaseService implements OnModuleInit {
  constructor(private readonly configService: ConfigService, private readonly prismaService: PrismaService) {
    super();
  }
  private provider: ethers.providers.JsonRpcProvider;
  onModuleInit() {
    this.provider = new ethers.providers.WebSocketProvider(this.configService.get('RPC_NETWORK_URL') as string);
  }

  async getEventByTxHash(
    getEventByTxHashInput: GetEventByTxHash,
    contractDetail: contract & {
      event: event[];
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

    if (!eventByTxHashRaws || isEmpty(eventByTxHashRaws)) return;

    return Promise.all(
      map(eventByTxHashRaws, async (eventByTxHashRaw) => ({
        ...pick(eventByTxHashRaw, ['event', 'blockNumber', 'blockHash', 'transactionHash']),
        ...pick(await eventByTxHashRaw.getTransactionReceipt(), ['from', 'to', 'status']),
        timestamp: (await eventByTxHashRaw.getBlock()).timestamp,
        eventValue: this.transformArgsEvent(eventByTxHashRaw.args, eventContractDetail.params as String[]),
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
      },
    });
  }

  transformArgsEvent(values: ethers.utils.Result, keys: any[]) {
    let args = {};

    if (values.length !== keys.length) return;
    keys.forEach((key, i) => {
      args[key] = values[i];
    });
    return args;
  }
}
