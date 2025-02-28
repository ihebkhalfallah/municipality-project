import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { User } from 'src/users/user.entity';
import { Event } from './event.entity';
import { MailerModule } from 'src/mailer/mailer.module';
// import { Document } from 'src/documents/documents.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    TypeOrmModule.forFeature([User]),
    // TypeOrmModule.forFeature([Document]),
    MailerModule,
  ],
  providers: [EventService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
