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
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ description: 'get information by company'})
  async getCompany(@Param() params, @Body() body): Promise<Company> {
    if (body && body.password) {
      return this.companyService.get(params.id, body.password);
    }
    throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
  }

  @Post('company/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ description: 'update company info'})
  async updateCompany(@Param() params, @Body() body): Promise<Company> {
    if (body && body.password) {
      return this.companyService.update(params.id, body.password, body);
    }
    throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
  }

  @Get('company/:id/wallets')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ description: 'get company wallet list'})
  async getCompanyWallets(@Param() params, @Body() body): Promise<Wallet[]> {
    if (body && body.password) {
      return this.companyService.walletList(params.id, body.password);
    }
    throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ description: 'get wallet information by uid'})
  async getWallet(@Param() params): Promise<Wallet> {
    return this.walletService.get(params.id);
  }

  @Post(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ description: 'login or activate wallet'})
  async activateWallet(@Param() params, @Body() walletData: WalletDto): Promise<Wallet> {
    return this.walletService.login(params.id, walletData);
  }

  @Post(':id/balance')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ description: 'update wallet balance'})
  async updateWalletBalance(@Param() params, @Body() walletData: WalletDto): Promise<Wallet> {
    return this.walletService.setBalance(params.id, walletData);
  }
}
