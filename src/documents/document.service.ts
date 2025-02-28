import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from 'src/event/event.entity';
import { Demande } from 'src/demande/demande.entity';
import { Authorization } from 'src/authorization/authorization.entity';
import { Comment } from 'src/comment/comment.entity';
import { Express } from 'express';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { Document } from './documents.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Demande)
    private demandeRepository: Repository<Demande>,
    @InjectRepository(Authorization)
    private authorizationRepository: Repository<Authorization>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  // Helper function to save the file to the server
  private saveFile(file: Express.Multer.File): string {
    const uploadDir = join(__dirname, '..', 'uploads');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = join(uploadDir, fileName);

    writeFileSync(filePath, file.buffer);

    return filePath;
  }

  async uploadDocument(
    file: Express.Multer.File,
    entityType: string,
    entityId: number,
  ): Promise<Document> {
    const filePath = this.saveFile(file);

    let entity: Event | Demande | Authorization | Comment | null;

    switch (entityType) {
      case 'event':
        entity = await this.eventRepository.findOneBy({ id: entityId });
        if (!entity) {
          throw new NotFoundException(`Event with ID ${entityId} not found`);
        }
        break;
      case 'demande':
        entity = await this.demandeRepository.findOneBy({ id: entityId });
        if (!entity) {
          throw new NotFoundException(`Demande with ID ${entityId} not found`);
        }
        break;
      case 'authorization':
        entity = await this.authorizationRepository.findOneBy({ id: entityId });
        if (!entity) {
          throw new NotFoundException(
            `Authorization with ID ${entityId} not found`,
          );
        }
        break;
      case 'comment':
        entity = await this.commentRepository.findOneBy({ id: entityId });
        if (!entity) {
          throw new NotFoundException(`Comment with ID ${entityId} not found`);
        }
        break;
      default:
        throw new BadRequestException('Invalid entity type');
    }

    // Create document with correct properties
    const document = new Document();
    document.filePath = filePath;
    document.uploadDate = new Date();

    // Only set the relevant entity and ID based on the entity type
    switch (entityType) {
      case 'event':
        document.event = entity as Event;
        document.eventId = entityId;
        break;
      case 'demande':
        document.demande = entity as Demande;
        document.demandeId = entityId;
        break;
      case 'authorization':
        document.authorization = entity as Authorization;
        document.authorizationId = entityId;
        break;
      case 'comment':
        document.comment = entity as Comment;
        document.commentId = entityId;
        break;
    }

    return this.documentRepository.save(document);
  }

  async getDocumentsByEntity(
    entityType: string,
    entityId: number,
  ): Promise<Document[]> {
    const whereCondition = { [`${entityType}Id`]: entityId };
    return this.documentRepository.find({ where: whereCondition });
  }
}
