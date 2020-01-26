import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Company, Wallet } from '../entity';
import { CompanyDto } from '../dto';
import { CompanyStatus } from '../enum';
import { WarehouseService } from './warehouse.service';
import { WalletService } from './wallet.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly warehouseService: WarehouseService,
    private readonly walletService: WalletService,
  ) {
  }

  async create(companyData: CompanyDto): Promise<Company> {
    try {
      const company = new Company();
      company.email = companyData.email ?? '';
      company.params = companyData.params ?? '';
      company.password = companyData.password  ?? '';
      company.status = CompanyStatus.ACTIVE;

      // create wh wallet
      company.warehouseWallet = await this.warehouseService.create();

      // store
      await this.companyRepository.save(company);

      // create push wallet's
      const params = JSON.parse(company.params);
      if (params && params.count && params.count > 0) {
        // complex company with many then one wallet
        for (let index = 0; index < params.count; index += 1) {
          await this.walletService.create(company);
        }
      } else {
        // simple company with one wallet
        await this.walletService.create(company);
      }

      return company;
    } catch (error) {
      global.console.error({ error, data: companyData });
      throw new HttpException('Fail to create new company', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async get(id: string, passwordHash: string): Promise<Company> {
    try {
      const company = await this.companyRepository.findOneOrFail(id);

      if (company.password !== passwordHash) {
        throw new Error('bad password');
      }

      return company;
    } catch (error) {
      global.console.error({ error, data: id });
      throw new HttpException('Fail to create new company', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, passwordHash: string, companyData: CompanyDto): Promise<Company> {
    const company = await this.get(id, passwordHash);
    company.email = companyData.email;
    company.params = companyData.params;
    company.password = companyData.password;
    company.status = companyData.status;

    // create push wallet's if need
    const params = JSON.parse(company.params);
    if (params && params.count && params.count > 0
      && params.count > company.wallets.length) {
      // complex company with many then one wallet
      for (let index = company.wallets.length; index < params.count; index += 1) {
        await this.walletService.create(company);
      }
    } else {
      if (company.wallets.length === 0) {
        // simple company with one wallet
        await this.walletService.create(company);
      }
    }

    return company;
  }

  async walletList(id: string, passwordHash: string): Promise<Wallet[]> {
    const company = await this.get(id, passwordHash);

    return company.wallets;
  }
}
