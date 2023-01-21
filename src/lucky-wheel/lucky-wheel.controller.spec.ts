import { PrismaService } from 'nestjs-prisma';
import { ModuleRef } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { LuckyWheelController } from './lucky-wheel.controller';
import { LuckyWheelService } from './lucky-wheel.service';

describe('LuckyWheelController', () => {
  let controller: LuckyWheelController;
  let service: LuckyWheelService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LuckyWheelController],
      providers: [LuckyWheelService, PrismaService],
    }).compile();

    controller = module.get<LuckyWheelController>(LuckyWheelController);

  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
