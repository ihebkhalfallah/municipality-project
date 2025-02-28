import { Module } from '@nestjs/common';
import { Demande } from './demande.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { MailerModule } from 'src/mailer/mailer.module';
import { DemandeService } from './demande.service';
import { DemandeController } from './demande.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Demande]),
    TypeOrmModule.forFeature([User]),
    MailerModule,
  ],
  providers: [DemandeService],
  controllers: [DemandeController],
  exports: [DemandeService],
})
export class DemandeModule {}
