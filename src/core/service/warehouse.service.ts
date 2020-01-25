import { Injectable } from '@nestjs/common';
import { generateWallet } from 'minterjs-wallet';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AES } from 'crypto-js';

import { Warehouse } from '../entity';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    private readonly configService: ConfigService,
  ) {
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
}
