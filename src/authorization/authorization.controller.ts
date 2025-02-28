import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { AuthorizationService } from './authorization.service';
import { CreateAuthrizationDto } from './dto/create-authorization.dto';
import { Authorization } from './authorization.entity';
import { AuthenticatedRequest } from 'src/types/user-payload.interface';
import { FindAuthorizationDto } from './dto/filter-authorization.dto';
import { UpdateAuthorizationDto } from './dto/update-authorization.dto';
import { Roles } from 'src/auth/role.decorator';
import { USER_ROLE } from 'src/users/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('authorizations')
export class AuthorizationController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  @Roles(
    USER_ROLE.ORGANIZATION,
    USER_ROLE.CITIZEN,
    USER_ROLE.DEMANDE_ADMIN,
    USER_ROLE.SUPER_ADMIN,
  )
  @Post()
  async createDemande(
    @Req() req: AuthenticatedRequest,
    @Body() createAuthorizationDto: CreateAuthrizationDto,
  ): Promise<Authorization> {
    try {
      const userId = req.user.userId;

      return await this.authorizationService.createAuthorization(
        userId,
        createAuthorizationDto,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Roles(
    USER_ROLE.ORGANIZATION,
    USER_ROLE.CITIZEN,
    USER_ROLE.DEMANDE_ADMIN,
    USER_ROLE.SUPER_ADMIN,
  )
  @Get()
  async findAll(@Query() findAuthorizationDto: FindAuthorizationDto): Promise<{
    data: Authorization[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return await this.authorizationService.findAll(findAuthorizationDto);
  }

  @Roles(
    USER_ROLE.ORGANIZATION,
    USER_ROLE.CITIZEN,
    USER_ROLE.DEMANDE_ADMIN,
    USER_ROLE.SUPER_ADMIN,
  )
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Authorization> {
    try {
      return await this.authorizationService.findOne(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Roles(
    USER_ROLE.ORGANIZATION,
    USER_ROLE.CITIZEN,
    USER_ROLE.DEMANDE_ADMIN,
    USER_ROLE.SUPER_ADMIN,
  )
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateAuthorizationDto: UpdateAuthorizationDto,
  ): Promise<Authorization> {
    try {
      return await this.authorizationService.updateAuthorization(
        id,
        updateAuthorizationDto,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Roles(
    USER_ROLE.ORGANIZATION,
    USER_ROLE.CITIZEN,
    USER_ROLE.DEMANDE_ADMIN,
    USER_ROLE.SUPER_ADMIN,
  )
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    try {
      await this.authorizationService.deleteAuthorization(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
