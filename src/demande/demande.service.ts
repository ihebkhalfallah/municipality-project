import { InjectRepository } from '@nestjs/typeorm';
import { Demande } from './demande.entity';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { MailerService } from 'src/mailer/mailer.service';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { documentMapping } from 'src/utils/document-mapping';
import { FindDemandeDto } from './dto/filter-demande.dto';
import { UpdateDemandeDto } from './dto/update-demande.dto';
import { DEMANDE_STATUS } from './demande-status.enum';

@Injectable()
export class DemandeService {
  constructor(
    @InjectRepository(Demande)
    private readonly demandeRepository: Repository<Demande>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
  ) {}

  async createDemande(
    userId: number,
    createDemandeDto: CreateDemandeDto,
  ): Promise<Demande> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }
    const date = new Date(Date.now());

    const demande = this.demandeRepository.create({
      ...createDemandeDto,
      date,
      createdBy: user,
      createdByUserId: user.id,
    });

    const createdDemande = await this.demandeRepository.save(demande);
    if (createdDemande.createdBy) {
      delete (createdDemande.createdBy as { password?: string }).password;
      delete (createdDemande.createdBy as { previousPassword?: string })
        .previousPassword;
    }
    return documentMapping(createdDemande, Demande);
  }

  async findAll(findDemandeDto: FindDemandeDto): Promise<{
    data: Demande[];
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
    } = findDemandeDto;

    const query = this.demandeRepository
      .createQueryBuilder('demande')
      .leftJoinAndSelect('demande.createdBy', 'user');

    if (name) query.andWhere('demande.name LIKE :name', { name: `%${name}%` });
    if (status) query.andWhere('demande.status = :status', { status });
    if (type) query.andWhere('demande.type = :type', { type });
    if (createdByUserId)
      query.andWhere('demande.createdByUserId = :createdByUserId', {
        createdByUserId,
      });

    query.orderBy(`demande.${sortBy}`, sortOrder);

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return { data, total, page, totalPages };
  }

  async updateDemande(
    idDemande: number,
    updateDemandeDto: UpdateDemandeDto,
  ): Promise<Demande> {
    const demande = await this.demandeRepository.findOne({
      where: { id: idDemande },
      relations: ['createdBy'],
    });

    if (!demande) {
      throw new NotFoundException('Demande not found');
    }

    Object.assign(demande, updateDemandeDto);

    // send email if demande status is changed

    const updatedDemande = await this.demandeRepository.save(demande);
    return documentMapping(updatedDemande, Demande);
  }

  async deleteDemande(idDemande: number): Promise<void> {
    const demande = await this.demandeRepository.findOne({
      where: { id: idDemande },
    });

    if (!demande) {
      throw new NotFoundException('Demande not found');
    }

    if (
      demande.status === DEMANDE_STATUS.ACCEPTED ||
      demande.status === DEMANDE_STATUS.REJECTED
    ) {
      throw new BadRequestException(
        "Can't delete an demand with ACCEPTED or REJECTED status.",
      );
    }

    await this.demandeRepository.remove(demande);
  }

  async findOne(idDemande: number): Promise<Demande> {
    const demand = await this.demandeRepository.findOne({
      where: { id: idDemande },
      relations: ['createdBy'],
    });

    if (!demand) {
      throw new NotFoundException('Demande not found');
    }

    return documentMapping(demand, Demande);
  }
}
