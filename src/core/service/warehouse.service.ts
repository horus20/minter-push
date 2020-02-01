import { Injectable } from '@nestjs/common';
import { generateWallet } from 'minterjs-wallet';
import { Minter, MinterApi, TX_TYPE } from 'minter-js-sdk';
import { Decimal } from 'decimal.js';
// import PostSignedTx from 'minter-js-sdk/src/api/post-signed-tx';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AES, enc } from 'crypto-js';
import axios from 'axios';

import { Warehouse } from '../entity';

const MINTER_DEFAULT_SYMBOL = 'BIP';

@Injectable()
export class WarehouseService {
  private minter;
  private minterApi;
  private explorerURL;
  private coins;

  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    private readonly configService: ConfigService,
  ) {
    const baseURL = this.configService.get<string>('MINTER_NODE_URL');
    const options = {
      apiType: 'node',
      baseURL,
    };
    this.minter = new Minter(options);
    this.minterApi = new MinterApi(options);
    this.explorerURL = this.configService.get<string>('MINTER_EXPLORER_URL');
    this.loadCoins();
  }

  async loadCoins() {
    this.coins = [];
    try {
      const response = await axios.get(`${this.explorerURL}/api/v1/coins`);
      if (response.data && response.data.data) {
        response.data.data.map((coin) => {
          // Given a coin supply (s), reserve balance (r), CRR (c) and a sell amount (a),
          // calculates the return for a given conversion
          // return r * (1 - (1 - a / s) ^ (1 / c));
          if (coin.symbol === MINTER_DEFAULT_SYMBOL) {
            this.coins[coin.symbol] = 1;
          } else {
            const c1 = new Decimal(1).div(coin.crr);
            const as = new Decimal(1).div(coin.volume);
            const as1 = new Decimal(1).minus(as);
            const as1c1 = as1.pow(c1);

            this.coins[coin.symbol] = new Decimal(coin.reserveBalance)
              .mul(new Decimal(1).minus(as1c1))
              .mul(100).toNumber();
          }
        });
      }
    } catch (error) {
      global.console.error(error);
    }
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
    if (response.data && response.data.data && response.data.data.balances) {
      warehouseWallet.setBalances(response.data.data.balances);

      await this.warehouseRepository.save(warehouseWallet);

      return ;
    }
    throw new Error('Fail to load balance');
  }

  async transfer(from: Warehouse, to: string, amount: string, symbol: string): Promise<boolean> {
    const password = this.configService.get<string>('WAREHOUSE_PASSWORD');
    const privateKey = AES.decrypt(from.seed, password)
      .toString(enc.Utf8);
    // todo: check balance > amount
    let data;
    let type = TX_TYPE.SEND;
    let feeSymbol = symbol;
    let isValid = true;
    const feeBip = 0.01;

    if (amount === '') {
      // send all balances
      if (from.getBalances().length > 1) {
        data = {
          list: [],
        };
        type = TX_TYPE.MULTISEND;
        const preData = from.getBalances().map(({ coin, amount: balance }) => {
          const fee = new Decimal(feeBip).div(this.coins[coin]).toNumber();
          if (coin === MINTER_DEFAULT_SYMBOL && Number(balance) > fee) {
            feeSymbol = coin;
          }
          if (feeSymbol === '' && Number(balance) > fee) {
            feeSymbol = coin;
          }

          return {
            to,
            value: Number(balance),
            coin,
          };
        });
        data.list = preData.map((item) => {
          if (item.coin === feeSymbol) {
            const fee = new Decimal(feeBip).div(this.coins[item.coin]);
            item.value = new Decimal(item.value).minus(fee).toNumber();
          }

          return item;
        });
      } else if (from.getBalances().length === 1) {
        const fee = new Decimal(feeBip).div(this.coins[from.getBalances()[0].coin]);
        data = {
          to,
          value: new Decimal(from.getBalances()[0].amount).minus(fee).toNumber(),
          coin: from.getBalances()[0].coin,
        };

        if (data.value < 0) {
          isValid = false;
        }
      }
    } else {
      data = {
        to,
        value: Number(amount),
        coin: symbol,
      };
    }

    if (!isValid) {
      global.console.info(`Try activate empty wallet ${to} (from address: ${from.mxaddress})`);
      return false;
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
    global.console.info(`New transfer from ${from.mxaddress} to ${to}. txHash: ${txHash}`);
    return true;
  }

  async sendRawTx(mxaddress, rawTx: string): Promise<string> {
    const response = await this.minterApi.get(`send_transaction?tx=0x${rawTx}`);
    if (response.data.error) {
      let msg = response.data.error.message;
      try {
        if (response.data.error.tx_result && response.data.error.tx_result.message) {
          msg = `${msg}. ${response.data.error.tx_result.message}`;
        }
      } catch (e) {
        // set do nothing
      }

      throw new Error(msg);
    }
    global.console.info(`Transfer from ${mxaddress}. txHash: ${response.data.result.hash}`);
    return response.data.result.hash;
  }
}
