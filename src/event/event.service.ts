import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { PaginationDto } from 'src/types/pagination.type';
import { UpdateEventDto } from './dto/update-event.dto';
import { EVENT_STATUS } from './event.enum';
import { FindEventDto } from './dto/filter-event.dto';
import { MailerService } from 'src/mailer/mailer.service';
import * as path from 'path';
import { documentMapping } from 'src/utils/document-mapping';
import { formatDateWithArabicMonthsAndTime } from 'src/utils/date-format';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
  ) {}

  async createEvent(
    userId: number,
    createEventDto: CreateEventDto,
  ): Promise<Event> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      createdBy: user,
      createdByUserId: user.id,
    });

    const createdEvent = await this.eventRepository.save(event);

    if (createdEvent.createdBy) {
      delete (createdEvent.createdBy as { password?: string }).password;
      delete (createdEvent.createdBy as { previousPassword?: string })
        .previousPassword;
    }

    return createdEvent;
  }

  async updateEvent(
    eventId: number,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['createdBy'],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    Object.assign(event, updateEventDto);
    const templatePath = path.join(
      __dirname,
      '..',
      'mailer',
      'templates',
      'event-status-change.html',
    );
    if (
      updateEventDto.status === EVENT_STATUS.ACCEPTED ||
      updateEventDto.status === EVENT_STATUS.REJECTED
    ) {
      const formatedDate = formatDateWithArabicMonthsAndTime(event.date);
      this.mailerService.sendMail({
        to: event.createdBy.email,
        subject: 'تحديث حالة الحدث',
        templatePath: templatePath,
        context: {
          name: event.createdBy.firstName || ' ' || event.createdBy.lastName,
          eventName: event.name,
          status: event.status,
          eventDate: formatedDate,
          eventLocation: event.location,
        },
      });
    }
    const updatedEvent = await this.eventRepository.save(event);

    return documentMapping(updatedEvent, Event);
  }

  async deleteEvent(eventId: number): Promise<void> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (
      event.status === EVENT_STATUS.ACCEPTED ||
      event.status === EVENT_STATUS.REJECTED
    ) {
      throw new BadRequestException(
        "Can't delete an event with ACCEPTED or REJECTED status.",
      );
    }

    await this.eventRepository.remove(event);
  }

  async findOne(eventId: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async findAll(findEventDto: FindEventDto): Promise<{
    data: Event[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC',
      name,
      status,
      type,
      createdByUserId,
    } = findEventDto;

    const query = this.eventRepository.createQueryBuilder('event');

    if (name) query.andWhere('event.name LIKE :name', { name: `%${name}%` });
    if (status) query.andWhere('event.status = :status', { status });
    if (type) query.andWhere('event.type = :type', { type });
    if (createdByUserId)
      query.andWhere('event.createdByUserId = :createdByUserId', {
        createdByUserId,
      });

    query.orderBy(`event.${sortBy}`, sortOrder);

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return { data, total, page, totalPages };
  }
}
