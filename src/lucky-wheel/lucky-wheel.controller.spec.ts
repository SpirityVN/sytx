import { Test, TestingModule } from '@nestjs/testing';
import { LuckyWheelController } from './lucky-wheel.controller';

describe('LuckyWheelController', () => {
  let controller: LuckyWheelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LuckyWheelController],
    }).compile();

    controller = module.get<LuckyWheelController>(LuckyWheelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
