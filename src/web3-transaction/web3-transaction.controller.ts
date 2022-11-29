import Axios from 'axios';
import { Web3TransactionService } from './web3-transaction.service';
import { Body, Controller, Get, Param, Post, BadRequestException } from '@nestjs/common';
import { CreateContractInput, CreateNetworkInput, GetEventByTxHash } from './web3-transaction.dto';
import { ApiTags } from '@nestjs/swagger';
import { transformEventByABI } from './web3-transaction.util';

@ApiTags('Web3 transaction')
@Controller('web3-transaction')
export class Web3TransactionController {
  constructor(private readonly web3TransactionService: Web3TransactionService) {}

  @Post('/:contractAddress/transaction')
  async getTransaction(@Param('contractAddress') contractAddress: string, @Body() getEventByTxHashInput: GetEventByTxHash) {
    const contractDetail = await this.web3TransactionService.findContractByAddress(contractAddress);

    if (!contractDetail) throw new BadRequestException('Contract not found');

    let transaction = await this.web3TransactionService.getEventByTxHash(getEventByTxHashInput, contractDetail);
    return transaction;
  }

  @Post('/create-contract')
  async createContract(@Body() payload: CreateContractInput) {
    return await this.web3TransactionService.createContract(payload);
  }

  @Post('/create-network')
  async createNetwork(@Body() payload: CreateNetworkInput) {
    return await this.web3TransactionService.createNetwork(payload);
  }

  @Get('/contracts')
  async getContracts() {
    return await this.web3TransactionService.getListContracts();
  }

  @Get('/contract/:id')
  async getContractDetail(@Param('id') contractId: string) {
    const contractDetail = await this.web3TransactionService.getContractDetail(contractId);
    let contractEvents = null;
    let { data } = await Axios.get(contractDetail.abi_url);
    if (data) {
      contractEvents = transformEventByABI(data);
    }

    return {
      ...contractDetail,
      events: contractEvents,
    };
  }

  @Get('/networks')
  async getNetworks() {
    return await this.web3TransactionService.getListNetworkSupport();
  }
}
