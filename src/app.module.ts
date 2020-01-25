import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';

@Module({
  imports: [TypeOrmModule.forRoot(), CoreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
