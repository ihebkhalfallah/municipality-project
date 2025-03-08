import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createDatabaseIfNotExists } from './db/create-db';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './utils/transform.interceptor';
import { QueryFailedExceptionFilter } from './utils/exception-filter';
import { HttpExceptionFilter } from './utils/all-exceptions.filter';
import { UserRoleSeed } from './seeds/user-role.seed';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  await createDatabaseIfNotExists();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(
    new QueryFailedExceptionFilter(),
    new HttpExceptionFilter(),
  );
  app.useGlobalInterceptors(new TransformInterceptor());

  app.enableCors({
    origin: 'http://localhost:3001', // change to env variable
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Serve static files from the 'uploads' directory
  app.useStaticAssets(path.join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const userRoleSeed = app.get(UserRoleSeed);
  await userRoleSeed.seed();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
