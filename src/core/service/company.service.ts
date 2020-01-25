import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Company, Wallet } from '../entity';
import { CompanyDto } from '../dto';
import { CompanyStatus } from '../enum';
import { WarehouseService } from './warehouse.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly warehouseService: WarehouseService,
  ) {
  }

  async create(companyData: CompanyDto): Promise<Company> {
    try {
      const company = new Company();
      company.email = companyData.email;
      company.params = companyData.params;
      company.password = companyData.password;
      company.status = CompanyStatus.ACTIVE;

      // create wh wallet
      company.warehouseWallet = await this.warehouseService.create();

      // store
      await this.companyRepository.save(company);

      return company;
    } catch (error) {
      global.console.error({ error, data: companyData });
      throw new HttpException('Fail to create new company', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

 /* async get(id: string, passwordHash: string): Promise<Company> {

  }

  async update(id: string, passwordHash: string, company: CompanyDto): Promise<Company> {

  }

  async walletList(id: string, passwordHash: string): Promise<Wallet[]> {

  }*/
}
