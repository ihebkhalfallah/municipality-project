import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Authorization } from './authorization.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { CreateAuthrizationDto } from './dto/create-authorization.dto';
import { documentMapping } from 'src/utils/document-mapping';
import { FindAuthorizationDto } from './dto/filter-authorization.dto';
import { UpdateAuthorizationDto } from './dto/update-authorization.dto';
import { AUTHORIZATION_STATUS } from './authorization-status.enum';

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(Authorization)
    private readonly authorizationRepository: Repository<Authorization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createAuthorization(
    userId: number,
    createAuthorizationDto: CreateAuthrizationDto,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const creation_date = new Date(Date.now());

    const createdAuth = await this.authorizationRepository.save({
      ...createAuthorizationDto,
      creation_date,
      createdBy: user,
      createdByUserId: user.id,
    });

    if (createdAuth.createdBy) {
      delete (createdAuth.createdBy as { password?: string }).password;
      delete (createdAuth.createdBy as { previousPassword?: string })
        .previousPassword;
    }

    return documentMapping(createdAuth, Authorization);
  }

  async findAll(findAuthorizationDto: FindAuthorizationDto): Promise<{
    data: Authorization[];
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
      createdByUserId,
      userRole,
      start_date,
      end_date,
      creation_date,
    } = findAuthorizationDto;

    const query = this.authorizationRepository
      .createQueryBuilder('authorization')
      .leftJoinAndSelect('authorization.createdBy', 'createdBy');

    if (name)
      query.andWhere('authorization.name LIKE :name', { name: `%${name}%` });
    if (status) query.andWhere('authorization.status = :status', { status });
    if (createdByUserId)
      query.andWhere('authorization.createdByUserId = :createdByUserId', {
        createdByUserId,
      });
    if (userRole) query.andWhere('createdBy.role = :userRole', { userRole });
    if (start_date)
      query.andWhere('authorization.start_date >= :start_date', { start_date });
    if (end_date)
      query.andWhere('authorization.end_date <= :end_date', { end_date });
    if (creation_date)
      query.andWhere('authorization.creation_date = :creation_date', {
        creation_date,
      });

    query.orderBy(`authorization.${sortBy}`, sortOrder);

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return { data, total, page, totalPages };
  }

  async updateAuthorization(
    idAuthorization: number,
    updateAuthorizationDto: UpdateAuthorizationDto,
  ): Promise<Authorization> {
    const authorization = await this.authorizationRepository.findOne({
      where: { id: idAuthorization },
      relations: ['createdBy'],
    });

    if (!authorization) {
      throw new NotFoundException('Authorization not found');
    }

    Object.assign(authorization, updateAuthorizationDto);

    // send email if authorization status is changed

    const updatedAuthorization =
      await this.authorizationRepository.save(authorization);
    return documentMapping(updatedAuthorization, Authorization);
  }

  async deleteAuthorization(idAuthorization: number): Promise<void> {
    const authorization = await this.authorizationRepository.findOne({
      where: { id: idAuthorization },
    });

    if (!authorization) {
      throw new NotFoundException('Authorization not found');
    }

    if (
      authorization.status === AUTHORIZATION_STATUS.ACCEPTED ||
      authorization.status === AUTHORIZATION_STATUS.REJECTED
    ) {
      throw new BadRequestException(
        "Can't delete an authorization with ACCEPTED or REJECTED status.",
      );
    }

    await this.authorizationRepository.remove(authorization);
  }

  async findOne(idAuthorization: number): Promise<Authorization> {
    const authorization = await this.authorizationRepository.findOne({
      where: { id: idAuthorization },
    });

    if (!authorization) {
      throw new NotFoundException('Authorization not found');
    }
    return authorization;
  }
}
