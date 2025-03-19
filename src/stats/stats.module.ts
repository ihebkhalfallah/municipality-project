import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Demande } from 'src/demande/demande.entity';
import { Event } from 'src/event/event.entity';
import { Authorization } from 'src/authorization/authorization.entity';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Demande, Event, Authorization])],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}
