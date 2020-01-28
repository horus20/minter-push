import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  const isDebug = __dirname.indexOf('dist\\src') > 0;
  const addtional = isDebug ? '..\\..' : '..';
  app.useStaticAssets(join(__dirname, addtional, 'public'));
  app.setBaseViewsDir(join(__dirname, addtional, 'views'));
  app.setViewEngine('hbs');

  await app.listen(3048);
}
bootstrap();
