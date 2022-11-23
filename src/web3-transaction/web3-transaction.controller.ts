import { Web3TransactionService } from './web3-transaction.service';
import { Body, Controller, Get, Param, Post, BadRequestException } from '@nestjs/common';
import { CreateContractInput, GetContractDetail, GetEventByTxHash } from './web3-transaction.dto';
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

  @Post('/create')
  async createContract(@Body() payload: CreateContractInput) {
    return await this.web3TransactionService.createContract(payload);
  }
}
