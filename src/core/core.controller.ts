import { Get, Post, Body, Put, Delete, Query, Param, Controller, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('api')
@Controller('api')
export class CoreController {

  @Get()
  @ApiOperation({ description: 'say core' })
  test(): string {
    return 'say core';
  }
}
