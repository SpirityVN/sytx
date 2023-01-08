import { Module } from '@nestjs/common';
import { LuckyWheelController } from './lucky-wheel.controller';
import { LuckyWheelService } from './lucky-wheel.service';

@Module({
  controllers: [LuckyWheelController],
  providers: [LuckyWheelService]
})
export class LuckyWheelModule {}
