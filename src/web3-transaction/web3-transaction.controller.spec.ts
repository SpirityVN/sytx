import { Test, TestingModule } from '@nestjs/testing';
import { Web3TransactionController } from './web3-transaction.controller';

describe('Web3TransactionController', () => {
  let controller: Web3TransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Web3TransactionController],
    }).compile();

    controller = module.get<Web3TransactionController>(Web3TransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
