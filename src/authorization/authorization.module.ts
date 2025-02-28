import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authorization } from './authorization.entity';
import { User } from 'src/users/user.entity';
import { MailerModule } from 'src/mailer/mailer.module';
import { AuthorizationService } from './authorization.service';
import { AuthorizationController } from './authorization.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Authorization]),
    TypeOrmModule.forFeature([User]),
    MailerModule,
  ],
  providers: [AuthorizationService],
  controllers: [AuthorizationController],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
