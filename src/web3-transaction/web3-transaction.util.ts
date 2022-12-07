import { BadRequestException } from '@nestjs/common';
import { contract, network_support } from '@prisma/client';
import Axios from 'axios';
import { ethers } from 'ethers';
import { filter, map } from 'lodash';

export type EventInput = {
  indexed: boolean;
  internalType: string;
  name: string;
  type: string;
};
export type ABIEvent = {
  anonymous: boolean;
  inputs: EventInput[];
  name: string;
  type: string;
};
export function flattenObject(Objects: Object, key: string) {
  return map(Objects, (object) => object[key]);
}

export function transformEventByABI(abi): { name: string; params: string[] }[] {
  const events: ABIEvent[] = filter(abi, { type: 'event' });
  if (events.length === 0) return;
  return map(events, (event) => ({
    name: event.name,
    params: flattenObject(event.inputs, 'name'),
  }));
}

export function transformArgsEvent(values: ethers.utils.Result, keys: any[]) {
  let args = {};

  if (values.length !== keys.length) return;
  keys.forEach((key, i) => {
    args[key] = values[i];
  });
  return args;
}

export function getProviderByContract(
  contractDetail: contract & {
    network_support: network_support;
  },
) {
  const provider =
    exportProviderViaURL(contractDetail.network_support.rpc_url) || exportProviderViaURL(contractDetail.network_support.rpc_url_backup);
  return provider;
}

export async function getABIByContract(
  contractDetail: contract & {
    network_support: network_support;
  },
) {
  const { data } = await Axios.get(contractDetail.abi_url);

  const abi = data['abi'] || data;

  if (!abi) throw new BadRequestException('ABI not found!');

  return abi;
}

export function getRangeBlocks(startBlock, latestBlock, step: number = 5000): { startBlock: number; endBlock: number }[] {
  let rangeBlocks = new Array();
  while (startBlock < latestBlock) {
    if (startBlock + step < latestBlock) {
      rangeBlocks.push({
        startBlock: startBlock,
        endBlock: startBlock + step,
      });
    } else {
      rangeBlocks.push({
        startBlock: startBlock,
        endBlock: startBlock + step,
      });
    }
    startBlock += step + 1;
  }
  return rangeBlocks;
}

export function exportProviderViaURL(providerUrl: string) {
  try {
    if (/^(https|http)/i.test(providerUrl)) {
      return new ethers.providers.JsonRpcProvider(providerUrl);
    }
    if (/^(wss|ws)/i.test(providerUrl)) {
      return new ethers.providers.WebSocketProvider(providerUrl);
    }
    return;
  } catch (error) {
    return;
  }
}
