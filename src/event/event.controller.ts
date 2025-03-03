import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { EventService } from './event.service';
import { DeepPartial } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { Roles } from 'src/auth/role.decorator';
import { USER_ROLE } from 'src/users/role.enum';
import { UpdateEventDto } from './dto/update-event.dto';
import { FindEventDto } from './dto/filter-event.dto';
import { AuthenticatedRequest } from 'src/types/user-payload.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Roles(
    USER_ROLE.ORGANIZATION,
    USER_ROLE.PERMISSION_ADMIN,
    USER_ROLE.SUPER_ADMIN,
  )
  @Post()
  create(
    @Body() createEventDto: CreateEventDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.userId;
    return this.eventService.createEvent(userId, createEventDto);
  }

  @Roles(
    USER_ROLE.ORGANIZATION,
    USER_ROLE.PERMISSION_ADMIN,
    USER_ROLE.SUPER_ADMIN,
  )
  @Patch(':eventId')
  update(
    @Param('eventId') eventId: number,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventService.updateEvent(eventId, updateEventDto);
  }

  @Roles(USER_ROLE.SUPER_ADMIN, USER_ROLE.ORGANIZATION)
  @Delete(':eventId')
  remove(@Param('eventId') eventId: number) {
    return this.eventService.deleteEvent(eventId);
  }

  @Roles(
    USER_ROLE.ORGANIZATION,
    USER_ROLE.PERMISSION_ADMIN,
    USER_ROLE.SUPER_ADMIN,
  )
  @Get(':eventId')
  findOne(@Param('eventId') eventId: number) {
    return this.eventService.findOne(eventId);
  }

  @Roles(
    USER_ROLE.ORGANIZATION,
    USER_ROLE.PERMISSION_ADMIN,
    USER_ROLE.SUPER_ADMIN,
  )
  @Get()
  findAll(
    @Query(new ValidationPipe({ transform: true })) findEventDto: FindEventDto,
  ) {
    return this.eventService.findAll(findEventDto);
  }
}
