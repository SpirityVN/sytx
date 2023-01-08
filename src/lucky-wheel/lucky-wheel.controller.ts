import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { LuckyWheelService } from './lucky-wheel.service';

@ApiTags('Lucky Wheel')
@Controller('lucky-wheel')
export class LuckyWheelController {
  constructor(private readonly luckyWheelService: LuckyWheelService) {}
  @Get('/rewards')
  async getListReward() {
    return await this.luckyWheelService.getListReward();
  }
}
