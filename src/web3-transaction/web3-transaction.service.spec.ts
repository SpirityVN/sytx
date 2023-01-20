import { PrismaService } from 'nestjs-prisma';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Web3TransactionService } from './web3-transaction.service';
import { CACHE_MANAGER } from '@nestjs/common';

describe('Web3TransactionService', () => {
  let service: Web3TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Web3TransactionService, ConfigService, PrismaService, { provide: CACHE_MANAGER, useValue: {} }],
    }).compile();

    service = module.get<Web3TransactionService>(Web3TransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
