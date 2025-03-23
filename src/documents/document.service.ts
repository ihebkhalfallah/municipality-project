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
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { Document } from './documents.entity';

@Injectable()
export class DocumentService {
  private readonly maxTotalFileSize: number;

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
  ) {
    const maxFileSizeEnv = process.env.MAX_TOTAL_FILE_SIZE_MB;
    this.maxTotalFileSize =
      (maxFileSizeEnv ? parseInt(maxFileSizeEnv, 10) : 10) * 1024 * 1024;
  }

  // Helper function to save the file to the server
  private saveFile(file: Express.Multer.File): {
    filePath: string;
    fileName: string;
  } {
    // Define the upload directory at the root level
    const uploadDir = join(__dirname, '..', '..', 'uploads');
    console.log(uploadDir);
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = join(uploadDir, fileName);

    writeFileSync(filePath, file.buffer);

    return {
      filePath,
      fileName: file.originalname,
    };
  }

  async checkTotalFileSize(
    entityType: string,
    entityId: number,
    newFileSize: number,
  ): Promise<void> {
    const documents = await this.getDocumentsByEntity(entityType, entityId);
    const totalSize =
      documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0) +
      newFileSize;

    if (totalSize > this.maxTotalFileSize) {
      throw new BadRequestException('Total file size cannot exceed 10MB');
    }
  }

  async uploadDocuments(
    files: Express.Multer.File[],
    entityType: string,
    entityId: number,
  ): Promise<Document[]> {
    if (
      !['event', 'demande', 'authorization', 'comment'].includes(entityType)
    ) {
      throw new BadRequestException('Invalid entity type');
    }

    const documents: Document[] = [];

    for (const file of files) {
      await this.checkTotalFileSize(entityType, entityId, file.size);

      const { filePath, fileName } = this.saveFile(file);

      let entity: Event | Demande | Authorization | Comment | null = null;

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
            throw new NotFoundException(
              `Demande with ID ${entityId} not found`,
            );
          }
          break;
        case 'authorization':
          entity = await this.authorizationRepository.findOneBy({
            id: entityId,
          });
          if (!entity) {
            throw new NotFoundException(
              `Authorization with ID ${entityId} not found`,
            );
          }
          break;
        case 'comment':
          entity = await this.commentRepository.findOneBy({ id: entityId });
          if (!entity) {
            throw new NotFoundException(
              `Comment with ID ${entityId} not found`,
            );
          }
          break;
      }

      // Create document with correct properties
      const document = new Document();
      document.filePath = filePath;
      document.originalFileName = fileName;
      document.fileSize = file.size;
      document.mimeType = file.mimetype;
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

      documents.push(await this.documentRepository.save(document));
    }

    return documents;
  }

  async getDocumentContent(
    documentId: number,
  ): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    const filePath = document.filePath;

    if (!existsSync(filePath)) {
      throw new NotFoundException(
        `File for document ID ${documentId} not found at path: ${filePath}`,
      );
    }

    try {
      const buffer = readFileSync(filePath);
      return {
        buffer,
        fileName: document.originalFileName,
        mimeType: document.mimeType,
      };
    } catch (error) {
      throw new NotFoundException(
        `File for document ID ${documentId} cannot be read at path: ${filePath}`,
      );
    }
  }

  async getDocumentsByEntity(
    entityType: string,
    entityId: number,
  ): Promise<Document[]> {
    // Validate entity type first
    if (
      !['event', 'demande', 'authorization', 'comment'].includes(entityType)
    ) {
      throw new BadRequestException('Invalid entity type');
    }

    const whereCondition = {};
    switch (entityType) {
      case 'event':
        whereCondition['eventId'] = entityId;
        break;
      case 'demande':
        whereCondition['demandeId'] = entityId;
        break;
      case 'authorization':
        whereCondition['authorizationId'] = entityId;
        break;
      case 'comment':
        whereCondition['commentId'] = entityId;
        break;
    }

    return this.documentRepository.find({ where: whereCondition });
  }

  async getAllDocuments(): Promise<Document[]> {
    return this.documentRepository.find();
  }

  async deleteDocument(documentId: number): Promise<{ success: boolean }> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    await this.documentRepository.remove(document);
    return { success: true };
  }
  async getEventDocumentContent(
    eventId: number,
  ): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
    // Find documents associated with this event
    const documents = await this.documentRepository.find({
      where: { eventId: eventId },
    });

    if (!documents || documents.length === 0) {
      throw new NotFoundException(
        `No documents found for event with ID ${eventId}`,
      );
    }
    const document = documents.sort(
      (a, b) =>
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime(),
    )[0];

    const filePath = document.filePath;

    if (!existsSync(filePath)) {
      throw new NotFoundException(
        `File for event ID ${eventId} not found at path: ${filePath}`,
      );
    }

    try {
      const buffer = readFileSync(filePath);
      return {
        buffer,
        fileName: document.originalFileName,
        mimeType: document.mimeType,
      };
    } catch (error) {
      throw new NotFoundException(
        `File for event ID ${eventId} cannot be read at path: ${filePath}`,
      );
    }
  }
}
