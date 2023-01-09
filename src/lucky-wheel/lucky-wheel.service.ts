import { CreateRewardDto } from './lucky-wheel.dto';
import { Injectable } from '@nestjs/common';
import { Sql } from '@prisma/client/runtime';
import { map } from 'lodash';
import { PrismaService } from 'nestjs-prisma';
import { weightedRandom } from './util';

@Injectable()
export class LuckyWheelService {
  constructor(private readonly prismaService: PrismaService) {}

  async getListReward() {
    return await this.prismaService.lucky_wheel_reward.findMany({ orderBy: { id: 'asc' } });
  }

  async spin() {
    let listReward = await this.getListReward();

    const weights = map(listReward, (reward) => reward.weight);

    return weightedRandom(listReward, weights);
  }

  async createReward(newReward: CreateRewardDto) {
    return await this.prismaService.lucky_wheel_reward.create({
      data: newReward,
    });
  }

  async deleteReward(id: number) {
    return await this.prismaService.lucky_wheel_reward.delete({
      where: {
        id: id,
      },
    });
  }
}
