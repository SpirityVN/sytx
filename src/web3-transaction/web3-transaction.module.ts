import { Module } from '@nestjs/common';
import { Web3TransactionService } from './web3-transaction.service';
import { Web3TransactionController } from './web3-transaction.controller';

@Module({
  providers: [Web3TransactionService],
  controllers: [Web3TransactionController]
})
export class Web3TransactionModule {}
