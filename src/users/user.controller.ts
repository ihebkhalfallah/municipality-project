import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  NotFoundException,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationDto } from 'src/types/pagination.type';
import {  FindUserDto } from 'src/users/dto/filteruser.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { USER_ROLE } from './role.enum';
import { CreateAdminDto } from './dto/create-admin.dto';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(USER_ROLE.SUPER_ADMIN)
  @Post('create-admin')
  async createAdmin(@Request() req, @Body() createAdminDto: CreateAdminDto) {
    return this.userService.createAdmin(req.user, createAdminDto);
  }

  @Get()
  findAll(@Query(new ValidationPipe({ transform: true })) findUserDto: FindUserDto) {
    return this.userService.findAll(findUserDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(+id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
