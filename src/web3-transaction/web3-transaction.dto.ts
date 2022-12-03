import { ApiProperty } from '@nestjs/swagger';
import { NetworkSupportType } from '@prisma/client';
import { IsEthereumAddress, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class GetContractDetail {
  @ApiProperty()
  contractAddress: string;
}

export class GetEventAll {
  @ApiProperty()
  @IsNotEmpty()
  eventName: string;

  @ApiProperty()
  @IsNotEmpty()
  startBlock: number;

  @ApiProperty()
  @IsOptional()
  limit?: number = 5;
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
