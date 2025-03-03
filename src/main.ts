import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createDatabaseIfNotExists } from './db/create-db';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './utils/transform.interceptor';
import { QueryFailedExceptionFilter } from './utils/exception-filter';
import { HttpExceptionFilter } from './utils/all-exceptions.filter';
import { UserRoleSeed } from './seeds/user-role.seed';

async function bootstrap() {
  await createDatabaseIfNotExists();
  const app = await NestFactory.create(AppModule);
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
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const userRoleSeed = app.get(UserRoleSeed);
  await userRoleSeed.seed();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
