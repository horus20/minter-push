import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as cryptoRandomString from 'crypto-random-string';

import { Company, Wallet } from '../entity';
import { CompanyStatus, WalletStatus } from '../enum';
import { WalletDto } from '../dto';
import { WarehouseService } from './warehouse.service';

const PUSH_WALLET_ID_LENGTH = 16;

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Company)
    private readonly walletRepository: Repository<Wallet>,
    private readonly warehouseService: WarehouseService,
  ) {
  }

  async create(company: Company): Promise<Wallet> {
    try {
      const wallet = new Wallet();
      wallet.company = company;
      wallet.wallet = this.generateUniqWalletId();
      wallet.status = WalletStatus.NEW;
      company.wallets.push(wallet);

      await this.walletRepository.save(wallet);

      return wallet;
    } catch (error) {
      global.console.error({ error, data: company.id });
      throw new HttpException('Fail to create wallet', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id: string): Promise<Wallet> {
    try {
      const wallet = await this.walletRepository.findOneOrFail({ wallet: id });
      if (wallet.status === WalletStatus.NEW) {
        return wallet;
      }
    } catch (error) {
      global.console.error({ error, data: id });
      throw new HttpException('Fail to get wallet', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    throw new HttpException('need login', HttpStatus.UNAUTHORIZED);
  }

  async login(id: string, walletData: WalletDto): Promise<Wallet> {
    try {
      const wallet = await this.walletRepository.findOneOrFail({ wallet: id });
      if (wallet.status === WalletStatus.NEW) {
        if (!walletData.mxaddress) {
          throw new Error('mxaddress fail');
        }

        wallet.mxaddress = walletData.mxaddress;
        // run active company procedure
        const isActivate = await this.activateWallet(wallet);

        if (isActivate) {
          wallet.status = WalletStatus.ACTIVE;
          await this.walletRepository.save(wallet);
          return wallet;
        } else {
          throw new Error('activated failed');
        }
      }
      if (walletData.mxaddress
        && wallet.mxaddress === walletData.mxaddress) {
        return wallet;
      }
    } catch (error) {
      global.console.error({ error, data: id });
      throw new HttpException('Fail to get wallet', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    throw new HttpException('need login', HttpStatus.UNAUTHORIZED);
  }

  async setBalance(id: string, walletData: WalletDto): Promise<Wallet> {
    const wallet = await this.login(id, walletData);

    wallet.balances = walletData.balances;
    await this.walletRepository.save(wallet);

    return wallet;
  }

  private generateUniqWalletId(): string {
    return cryptoRandomString({
      length: PUSH_WALLET_ID_LENGTH,
      type: 'hex',
    });
  }

  private async activateWallet(wallet: Wallet): Promise<boolean> {
    try {
      if (wallet.status !== WalletStatus.NEW
        && wallet.company.status !== CompanyStatus.ACTIVE) {
        return false;
      }
      if (!wallet.mxaddress) {
        return false;
      }
      // check wh wallet balance
      await this.warehouseService.checkBalance(wallet.company.warehouseWallet);
      // transfer from wh wallet > push wallet
      const params = wallet.company.getParams();
      const amount = (params && params.count && params.amount && params.count > 0)
        ? params.amount
        : '';
      const symbol = (params && params.count && params.symbol && params.count > 0)
        ? params.symbol
        : '';
      await this.warehouseService.transfer(
        wallet.company.warehouseWallet,
        wallet.mxaddress,
        amount,
        symbol,
      );

      return true;
    } catch (error) {
      global.console.error(error, 'error activated wallet', wallet);
      return false;
    }
  }
}
