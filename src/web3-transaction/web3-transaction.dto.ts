import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { NetworkSupportType, Prisma } from '@prisma/client';
import { IsArray, IsEthereumAddress, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

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
  @IsUrl()
  abiUrl: string;

  @ApiProperty()
  @IsNotEmpty()
  contractAddress: string;

  @ApiProperty({
    isArray: true,
  })
  @IsNotEmpty()
  events: Event;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  networkSupportId: number;
}

export class CreateNetworkInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  networkName: string;

  @ApiProperty()
  @IsNotEmpty()
  networkType: NetworkSupportType;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  chainId: number;

  @ApiProperty()
  @IsNotEmpty()
  rpcUrl: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  rpcUrlBackup: string;

  @ApiProperty()
  @IsNotEmpty()
  iconNetworkUrl: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  currencySymbol: string;

  @ApiProperty()
  @IsOptional()
  blockExplorerUrl: string;
}
