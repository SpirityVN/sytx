import { Test, TestingModule } from '@nestjs/testing';
import { LuckyWheelService } from './lucky-wheel.service';

describe('LuckyWheelService', () => {
  let service: LuckyWheelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LuckyWheelService],
    }).compile();

    service = module.get<LuckyWheelService>(LuckyWheelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
