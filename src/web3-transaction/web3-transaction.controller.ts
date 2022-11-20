import { Web3TransactionService } from './web3-transaction.service';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateContractInput, GetContractDetail, GetTransaction } from './web3-transaction.dto';

@Controller('web3-transaction')
export class Web3TransactionController {
  constructor(private readonly web3TransactionService: Web3TransactionService) {}

  @Post('/:contractAddress/transaction')
  async getTransaction(@Param('contractAddress') contractAddress: string, @Body() getTransactionInput: GetTransaction) {
    const contractDetail = await this.web3TransactionService.findContractByAddress(contractAddress);

    let transaction = await this.web3TransactionService.getTransaction(getTransactionInput, contractDetail);

    return transaction;
  }

  @Post()
  async createContract(@Body() payload: CreateContractInput) {
    console.log(payload);
    return await this.web3TransactionService.createContract(payload);
  }
}
