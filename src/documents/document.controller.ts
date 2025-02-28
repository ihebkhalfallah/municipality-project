import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  Get,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { Express } from 'express';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload/:entityType/:entityId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: number,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      return await this.documentService.uploadDocument(
        file,
        entityType,
        entityId,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Get(':entityType/:entityId')
  async getDocuments(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: number,
  ) {
    return this.documentService.getDocumentsByEntity(entityType, entityId);
  }
}
