import { Module  } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { CoreController } from './core.controller';
import { Company, Wallet, Warehouse } from './entity';
import { CompanyService, PartnerService, WalletService, WarehouseService } from './service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Warehouse, Company, Wallet])],
  controllers: [CoreController],
  providers: [CompanyService, WarehouseService, WalletService, PartnerService],
  // exports: [CoreService],
})
export class CoreModule {}
