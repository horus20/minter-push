import {
  Get,
  Post,
  Body,
  Put,
  Delete,
  Query,
  Param,
  Controller,
  ClassSerializerInterceptor,
  UseInterceptors,
  HttpException, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Company, Wallet } from './entity';
import { CompanyDto, WalletDto } from './dto';
import { CompanyService, WalletService } from './service';

@ApiTags('api')
@Controller('api')
export class CoreController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly walletService: WalletService,
  ) {
  }

  @Get()
  @ApiOperation({ description: 'say core' })
  test(): string {
    return 'say core';
  }

  @Post('company')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ description: 'create company simple/complex'})
  async createCompany(@Body() company: CompanyDto): Promise<Company> {
    return this.companyService.create(company);
  }

  @Get('company/:id')
  @ApiOperation({ description: 'get information by company'})
  async getCompany(@Param() params, @Body() password: string): Promise<Company> {
    return this.companyService.get(params.id, password);
  }

  @Post('company/:id')
  @ApiOperation({ description: 'update company info'})
  async updateCompany(@Param() params, @Body() password: string, @Body() company: CompanyDto): Promise<Company> {
    return this.companyService.update(params.id, password, company);
  }

  @Get('company/:id/wallets')
  @ApiOperation({ description: 'get company wallet list'})
  async getCompanyWallets(@Param() params, @Body() password: string): Promise<Wallet[]> {
    return this.companyService.walletList(params.id, password);
  }

  @Get(':id')
  @ApiOperation({ description: 'get wallet information by uid'})
  async getWallet(@Param() params): Promise<Wallet> {
    return this.walletService.get(params.id);
  }

  @Post(':id')
  @ApiOperation({ description: 'login or activate wallet'})
  async activateWallet(@Param() params, @Body() walletData: WalletDto): Promise<Wallet> {
    return this.walletService.login(params.id, walletData);
  }

  @Post(':id/balance')
  @ApiOperation({ description: 'update wallet balance'})
  async updateWalletBalance(@Param() params, @Body() walletData: WalletDto): Promise<Wallet> {
    return this.walletService.setBalance(params.id, walletData);
  }
}
