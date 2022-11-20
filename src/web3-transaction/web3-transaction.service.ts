import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, Contract } from 'ethers';
import Axios from 'axios';
import { BaseService } from 'src/_services/base.service';
@Injectable()
export class Web3TransactionService extends BaseService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {
    super();
  }
  private provider: ethers.providers.JsonRpcProvider;
  onModuleInit() {
    this.provider = new ethers.providers.WebSocketProvider(this.configService.get('RPC_NETWORK_URL') as string);
  }

  convertArray2Object(arr) {
    let temp = [];
    for (let key in arr) {
      let clone = Object.assign({}, arr[key]);
      temp.push(clone);
    }
    return temp;
  }

  async test() {
    const abi_url = 'https://firebasestorage.googleapis.com/v0/b/sytx-ce64a.appspot.com/o/minesweeper.json?alt=media';
    const contract_address = '0xC56989b1117A219ADA00E213776093B098101a59';
    const data = await this.fetchCacheable('contract', async () => {
      let { data } = await Axios.get(abi_url);
      return data;
    });

    const contract = new Contract(contract_address, data, this.provider);

    let [buyTurnBy, block] = await Promise.all([
      contract.filters.BuyTurn('0xe3bb87c766d7537ba75d0214232efb4a22a6edcd'),
      this.provider.getBlock(24753103),
    ]);
    let buyTurn = await contract.queryFilter(buyTurnBy, block.number, block.number + 4999);
    return {
      ...block,
      event: buyTurn,
    };
    // console.log(await this.provider.getGasPrice());
  }
}
