import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from '../users/user.entity';
import { Event } from '../event/event.entity';
import { Demande } from '../demande/demande.entity';
import { Authorization } from '../authorization/authorization.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { FindAllCommentsDto } from './dto/filter-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Demande)
    private readonly demandeRepository: Repository<Demande>,
    @InjectRepository(Authorization)
    private readonly authorizationRepository: Repository<Authorization>,
  ) {}

  async createComment(
    userId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const { commentText, eventId, demandeId, authorizationId } =
      createCommentDto;

    const comment = this.commentRepository.create({
      commentText,
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    comment.userId = userId;

    if (eventId) {
      const event = await this.eventRepository.findOne({
        where: { id: eventId },
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      comment.event = event;
    }

    if (demandeId) {
      const demande = await this.demandeRepository.findOne({
        where: { id: demandeId },
      });
      if (!demande) {
        throw new NotFoundException('Demande not found');
      }
      comment.demande = demande;
    }

    if (authorizationId) {
      const authorization = await this.authorizationRepository.findOne({
        where: { id: authorizationId },
      });
      if (!authorization) {
        throw new NotFoundException('Authorization not found');
      }
      comment.authorization = authorization;
    }

    return this.commentRepository.save(comment);
  }

  async findAll(findAllCommentsDto: FindAllCommentsDto): Promise<{
    data: Comment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      eventId,
      demandeId,
      authorizationId,
      userId,
    } = findAllCommentsDto;

    const where: FindOptionsWhere<Comment> = {};
    if (eventId) where.eventId = eventId;
    if (demandeId) where.demandeId = demandeId;
    if (authorizationId) where.authorizationId = authorizationId;
    if (userId) where.userId = userId;

    const [data, total] = await this.commentRepository.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async updateComment(
    id: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    Object.assign(comment, updateCommentDto);

    return this.commentRepository.save(comment);
  }

  async deleteComment(id: number): Promise<void> {
    const comment = await this.findOne(id);

    await this.commentRepository.remove(comment);
  }
}
