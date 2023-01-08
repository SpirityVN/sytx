import { Injectable } from '@nestjs/common';
import { Sql } from '@prisma/client/runtime';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class LuckyWheelService {
  constructor(private readonly prismaService: PrismaService) {}

  async getListReward() {
    let data = this.prismaService.lucky_wheel_reward.findMany();

    console.log(data);
    return data;
  }
}
