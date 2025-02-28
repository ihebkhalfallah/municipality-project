import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { Event } from '../event/event.entity';
import { Demande } from '../demande/demande.entity';
import { Authorization } from '../authorization/authorization.entity';
import { Comment } from '../comment/comment.entity';
import { Document } from './documents.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Document,
      Event,
      Demande,
      Authorization,
      Comment,
    ]),
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
