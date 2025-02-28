import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { User } from 'src/users/user.entity';
import { Event } from 'src/event/event.entity';
import { Authorization } from 'src/authorization/authorization.entity';
import { Demande } from 'src/demande/demande.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Event]),
    TypeOrmModule.forFeature([Authorization]),
    TypeOrmModule.forFeature([Demande]),
  ],
  providers: [CommentService],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule {}
