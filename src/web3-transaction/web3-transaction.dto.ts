import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsArray, IsEthereumAddress, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetContractDetail {
  @ApiProperty()
  contractAddress: string;
}
export class GetEventByTxHash {
  @ApiProperty()
  @IsEthereumAddress()
  myAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  txHash: string;

  @ApiProperty()
  @IsNotEmpty()
  eventName: string;
}

class Event {
  name: string;
  params: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
}
export class CreateContractInput {
  @ApiProperty()
  @IsNotEmpty()
  contractName: string;

  @ApiProperty()
  @IsNotEmpty()
  abiUrl: string;

  @ApiProperty()
  @IsNotEmpty()
  contractAddress: string;

  @ApiProperty({
    isArray: true,
  })
  @IsNotEmpty()
  events: Event;
}
