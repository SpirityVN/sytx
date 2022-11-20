import { Web3TransactionService } from './web3-transaction.service';
import { Controller, Get } from '@nestjs/common';

@Controller('web3-transaction')
export class Web3TransactionController {
  constructor(private readonly web3TransactionService: Web3TransactionService) {}

  @Get()
  async getTransaction() {
    return await this.web3TransactionService.test();
  }
}
