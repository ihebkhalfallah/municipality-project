import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './users/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MailerService } from './mailer/mailer.service';
import { MailerModule } from './mailer/mailer.module';
import { EventModule } from './event/event.module';
import { DemandeModule } from './demande/demande.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { CommentModule } from './comment/comment.module';
import { DocumentModule } from './documents/document.module';
import { UserRoleSeed } from './seeds/user-role.seed';
import { User } from './users/user.entity';
import { MulterModule } from '@nestjs/platform-express';
import { LoggerMiddleware } from './middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
    MulterModule.register({
      dest: './uploads',
    }),
    UserModule,
    AuthModule,
    MailerModule,
    EventModule,
    DemandeModule,
    AuthorizationModule,
    CommentModule,
    DocumentModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailerService, UserRoleSeed],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
