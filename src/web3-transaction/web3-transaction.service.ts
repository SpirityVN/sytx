import { PrismaService } from 'nestjs-prisma';
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, Contract } from 'ethers';
import Axios from 'axios';
import { BaseService } from 'src/_services/base.service';
import { GetTransaction, CreateContractInput } from './web3-transaction.dto';
import { contract, event, Prisma } from '@prisma/client';
import { find, map } from 'lodash';
@Injectable()
export class Web3TransactionService extends BaseService implements OnModuleInit {
  constructor(private readonly configService: ConfigService, private readonly prismaService: PrismaService) {
    super();
  }
  private provider: ethers.providers.JsonRpcProvider;
  onModuleInit() {
    this.provider = new ethers.providers.WebSocketProvider(this.configService.get('RPC_NETWORK_URL') as string);
  }

  async getTransaction(
    getTransactionInput: GetTransaction,
    contractDetail: contract & {
      event: event[];
    },
  ) {
    const abi = await Axios.get(contractDetail.abi_url);

    const contract = new Contract(contractDetail.address, abi.data, this.provider);

    let eventContractDetail = find(contractDetail.event, (e) => e.name === getTransactionInput.eventName);
    if (!eventContractDetail) throw new BadRequestException('Event not exist');

    let [eventFilter, transactionReceipt] = await Promise.all([
      contract.filters[`${eventContractDetail.name}`](getTransactionInput.myAddress),
      this.provider.getTransactionReceipt(getTransactionInput.txHash),
    ]);

    let currentBlock = await this.provider.getBlock(transactionReceipt.blockHash);

    let eventByTxHashRaw = await contract.queryFilter(eventFilter, transactionReceipt.blockNumber, transactionReceipt.blockNumber + 4999);

    let eventByTxHash = find(eventByTxHashRaw, (e) => e.transactionHash === getTransactionInput.txHash);

    if (!eventByTxHash) return;
    return {
      timestamp: currentBlock.timestamp,
      transaction: transactionReceipt,
      event: {
        ...eventByTxHash,
        args: this.transformArgsEvent(eventByTxHash.args, eventContractDetail.params as String[]),
      },
    };
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
