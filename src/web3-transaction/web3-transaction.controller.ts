import { Web3TransactionService } from './web3-transaction.service';
import { Body, Controller, Get, Param, Post, BadRequestException } from '@nestjs/common';
import { CreateContractInput, CreateNetworkInput, GetContractDetail, GetEventByTxHash } from './web3-transaction.dto';
import { ApiTags } from '@nestjs/swagger';

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
    console.log(payload);
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
    return await this.web3TransactionService.getContractDetail(contractId);
  }

  @Get('/networks')
  async getNetworks() {
    return await this.web3TransactionService.getListNetworkSupport();
  }
}
