import { CACHE_MANAGER } from '@nestjs/common';
import { BaseService } from 'src/_services/base.service';
import { PrismaService } from 'nestjs-prisma';
import { Web3TransactionService } from './web3-transaction.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Web3TransactionController } from './web3-transaction.controller';

describe('Web3TransactionController', () => {
  let controller: Web3TransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Web3TransactionController],
      providers: [Web3TransactionService, PrismaService, { provide: CACHE_MANAGER, useValue: {} }],
    }).compile();

    controller = module.get<Web3TransactionController>(Web3TransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
