import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUserDto } from 'src/users/dto/filteruser.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { documentMapping } from 'src/utils/document-mapping';
import { USER_ROLE } from './role.enum';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    user.previousPassword = hashedPassword;
    const createdUser = await this.userRepository.save(user);
    return documentMapping(createdUser, User);
  }

  async findAll(findUserDto: FindUserDto): Promise<{
    data: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC',
      firstName,
      lastName,
      email,
      role,
      birthDate,
      cin,
      idAssociation,
      job,
    } = findUserDto;

    const query = this.userRepository.createQueryBuilder('user');

    if (firstName)
      query.andWhere('user.firstName LIKE :firstName', {
        firstName: `%${firstName}%`,
      });
    if (lastName)
      query.andWhere('user.lastName LIKE :lastName', {
        lastName: `%${lastName}%`,
      });
    if (email)
      query.andWhere('user.email LIKE :email', { email: `%${email}%` });
    if (role) query.andWhere('user.role = :role', { role });
    if (birthDate) query.andWhere('user.birthDate = :birthDate', { birthDate });
    if (cin) query.andWhere('user.cin = :cin', { cin });
    if (idAssociation)
      query.andWhere('user.idAssociation = :idAssociation', { idAssociation });
    if (job) query.andWhere('user.job LIKE :job', { job: `%${job}%` });

    query.orderBy(`user.${sortBy}`, sortOrder);

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page: +page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return documentMapping(user, User);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // const user = await this.userRepository.findOne({
    //   where: { id },
    //   select: ['id', 'firstName', 'lastName', 'email', 'password'],
    // });
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (updateUserDto.password) {
      if (!updateUserDto.previousPassword) {
        throw new ConflictException(
          'Old password is required to update the password.',
        );
      }

      const isOldPasswordValid = await bcrypt.compare(
        updateUserDto.previousPassword,
        user.password,
      );
      if (!isOldPasswordValid) {
        throw new ConflictException('Old password is incorrect.');
      }

      const isSamePassword = await bcrypt.compare(
        updateUserDto.password,
        user.password,
      );
      if (isSamePassword) {
        throw new ConflictException(
          'You have used this password before. Please choose a different password.',
        );
      }

      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);
    return documentMapping(updatedUser, User);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async findOneByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
  async createAdmin(creatorUser: User, createAdminDto: CreateAdminDto) {
    if (creatorUser.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Only SUPER_ADMIN can create admins');
    }

    if (
      createAdminDto.role === 'SUPER_ADMIN' &&
      creatorUser.role !== 'SUPER_ADMIN'
    ) {
      throw new UnauthorizedException(
        'Only a SUPER_ADMIN can create another SUPER_ADMIN',
      );
    }

    const existingUser = await this.findOneByEmail(createAdminDto.email);
    if (existingUser) throw new BadRequestException('Email already in use');

    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
    createAdminDto.password = hashedPassword;
    const newAdmin = this.userRepository.create(createAdminDto);

    await this.userRepository.save(newAdmin);

    return {
      user: { id: newAdmin.id, email: newAdmin.email, role: newAdmin.role },
    };
  }

  async uploadProfilePhoto(
    id: number,
    file: Express.Multer.File,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const base64Data = file.buffer.toString('base64');
    user.profile_photo = `data:${file.mimetype};base64,${base64Data}`;

    const updatedUser = await this.userRepository.save(user);
    return documentMapping(updatedUser, User);
  }
}
