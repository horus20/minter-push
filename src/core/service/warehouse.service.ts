import { Injectable } from '@nestjs/common';
import { generateWallet } from 'minterjs-wallet';
import { Minter, TX_TYPE } from 'minter-js-sdk';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AES } from 'crypto-js';
import axios from 'axios';

import { Warehouse } from '../entity';

const MINTER_DEFAULT_SYMBOL = 'BIP';

@Injectable()
export class WarehouseService {
  private minter;
  private explorerURL;

  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    private readonly configService: ConfigService,
  ) {
    const baseURL = this.configService.get<string>('MINTER_NODE_URL');
    this.minter = new Minter({
      apiType: 'node',
      baseURL,
    });
    this.explorerURL = this.configService.get<string>('MINTER_EXPLORER_URL');
  }

  async create(): Promise<Warehouse> {
    const password = this.configService.get<string>('WAREHOUSE_PASSWORD');
    const mxWallet = await generateWallet();
    const warehouse = new Warehouse();
    warehouse.mxaddress = mxWallet.getAddressString();
    warehouse.seed = AES.encrypt(mxWallet.getPrivateKeyString(), password)
      .toString();

    await this.warehouseRepository.save(warehouse);

    return warehouse;
  }

  async checkBalance(warehouseWallet: Warehouse) {
    // get account info from explorer
    const response = await axios.get(
      `${this.explorerURL}/api/v1/addresses/${warehouseWallet.mxaddress}`,
    );
    if (response.data && response.data.balances) {
      warehouseWallet.setBalances(response.data.balances);

      await this.warehouseRepository.save(warehouseWallet);
    }
  }

  async transfer(from: Warehouse, to: string, amount: string, symbol: string) {
    const password = this.configService.get<string>('WAREHOUSE_PASSWORD');
    const privateKey = AES.decrypt(from.seed, password)
      .toString();
    // todo: add get estimate fee and calculate amount to send (balance - fee)
    let data;
    let type = TX_TYPE.SEND;
    let feeSymbol = symbol;

    if (amount === '') {
      // send all balances
      if (from.getBalances().length > 0) {
        type = TX_TYPE.MULTISEND;
      }
      data.list = from.getBalances().map(({ coin, amount: balance }) => {
        if (coin === MINTER_DEFAULT_SYMBOL && Number(balance) > 0) {
          feeSymbol = coin;
        }

        return {
          to,
          value: Number(balance),
          coin,
        };
      });
    } else {
      data = {
        to,
        value: Number(amount),
        coin: symbol,
      };
    }
    const txParams = {
      privateKey,
      chainId: 1,
      type,
      data,
      gasCoin: feeSymbol,
      payload: '',
    };
    const txHash = await this.minter.postTx(txParams);
    global.console.info(txHash);
  }
}
