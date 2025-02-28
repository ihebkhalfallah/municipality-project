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
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DemandeService } from './demande.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { Demande } from './demande.entity';
import { FindDemandeDto } from './dto/filter-demande.dto';
import { UpdateDemandeDto } from './dto/update-demande.dto';
import { Request } from 'express';
import { AuthenticatedRequest } from 'src/types/user-payload.interface';
import { Roles } from 'src/auth/role.decorator';
import { USER_ROLE } from 'src/users/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('demandes')
export class DemandeController {
  constructor(private readonly demandeService: DemandeService) {}

  @Roles(
    USER_ROLE.ORGANIZATION,
    USER_ROLE.CITIZEN,
    USER_ROLE.CONTESTATION_ADMIN,
    USER_ROLE.SUPER_ADMIN,
  )
  @Post()
  async createDemande(
    @Body() createDemandeDto: CreateDemandeDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Demande> {
    try {
      const userId = req.user.userId;
      return await this.demandeService.createDemande(userId, createDemandeDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Roles(
    USER_ROLE.ORGANIZATION,
    USER_ROLE.CITIZEN,
    USER_ROLE.CONTESTATION_ADMIN,
    USER_ROLE.SUPER_ADMIN,
  )
  @Get()
  async findAll(@Query() findDemandeDto: FindDemandeDto): Promise<{
    data: Demande[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return await this.demandeService.findAll(findDemandeDto);
  }

  @Roles(
    USER_ROLE.ORGANIZATION,
    USER_ROLE.CITIZEN,
    USER_ROLE.CONTESTATION_ADMIN,
    USER_ROLE.SUPER_ADMIN,
  )
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Demande> {
    try {
      return await this.demandeService.findOne(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Roles(
    USER_ROLE.ORGANIZATION,
    USER_ROLE.CITIZEN,
    USER_ROLE.CONTESTATION_ADMIN,
    USER_ROLE.SUPER_ADMIN,
  )
  @Patch(':id')
  async updateDemande(
    @Param('id') id: number,
    @Body() updateDemandeDto: UpdateDemandeDto,
  ): Promise<Demande> {
    try {
      return await this.demandeService.updateDemande(id, updateDemandeDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Roles(
    USER_ROLE.ORGANIZATION,
    USER_ROLE.CITIZEN,
    USER_ROLE.SUPER_ADMIN,
  )
  @Delete(':id')
  async deleteDemande(@Param('id') id: number): Promise<void> {
    try {
      await this.demandeService.deleteDemande(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
