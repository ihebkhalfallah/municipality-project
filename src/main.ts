import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createDatabaseIfNotExists } from './db/create-db';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './utils/transform.interceptor';
import { QueryFailedExceptionFilter } from './utils/exception-filter';
import { HttpExceptionFilter } from './utils/all-exceptions.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as morgan from 'morgan';
import { UserRoleSeed } from './seeds/user-role.seed';

async function bootstrap() {
  console.log(process.env.CORS_ORIGIN);
  console.log(`VAR1: ${process.env.VAR1}`);
  console.log(`VAR2: ${process.env.VAR2}`);
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

  const corsOrigins = [process.env.VAR1, process.env.VAR2].filter(
    Boolean,
  ) as string[];

  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Serve static files from the 'uploads' directory
  app.useStaticAssets(path.join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms'),
  );

  const userRoleSeed = app.get(UserRoleSeed);
  await userRoleSeed.seed();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
