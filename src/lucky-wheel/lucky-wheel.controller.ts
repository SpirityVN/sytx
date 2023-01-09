import { CreateRewardDto } from './lucky-wheel.dto';
import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { LuckyWheelService } from './lucky-wheel.service';

@ApiTags('Lucky Wheel')
@Controller('lucky-wheel')
export class LuckyWheelController {
  constructor(private readonly luckyWheelService: LuckyWheelService) {}
  @Get('/rewards')
  async getListReward() {
    return await this.luckyWheelService.getListReward();
  }

  @Post('/spin')
  async spin() {
    return await this.luckyWheelService.spin();
  }

  @Post('/create-reward')
  async createReward(@Body() newReward: CreateRewardDto) {
    return await this.luckyWheelService.createReward(newReward);
  }
}
