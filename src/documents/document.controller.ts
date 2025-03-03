import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Param,
  Get,
  Delete,
  BadRequestException,
  NotFoundException,
  Res,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { Express, Response } from 'express';
import { existsSync, readFileSync } from 'fs';
import * as JSZip from 'jszip';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload/:entityType/:entityId')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('entityType') entityType: string,
    @Param('entityId', ParseIntPipe) entityId: number,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    try {
      const result = await this.documentService.uploadDocuments(
        files,
        entityType,
        entityId,
      );
      return {
        success: true,
        message: `${files.length} file(s) uploaded successfully`,
        documents: result.map((doc) => ({
          id: doc.id,
          fileName: doc.originalFileName,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          uploadDate: doc.uploadDate,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Get()
  async getAllDocuments() {
    try {
      const documents = await this.documentService.getAllDocuments();
      return documents.map((doc) => ({
        id: doc.id,
        fileName: doc.originalFileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        uploadDate: doc.uploadDate,
        entityType: this.getEntityType(doc),
      }));
    } catch (error) {
      throw new BadRequestException('Error retrieving documents');
    }
  }

  @Get(':entityType/:entityId')
  async getDocuments(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseIntPipe) entityId: number,
  ) {
    try {
      const documents = await this.documentService.getDocumentsByEntity(
        entityType,
        entityId,
      );
      return documents.map((doc) => ({
        id: doc.id,
        fileName: doc.originalFileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        uploadDate: doc.uploadDate,
      }));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error retrieving documents');
    }
  }

  @Get('download')
  async downloadDocumentByQuery(
    @Query('id') documentId: string,
    @Res() res: Response,
  ) {
    try {
      const id = parseInt(documentId, 10);

      if (isNaN(id)) {
        throw new BadRequestException('Document ID must be a number');
      }

      const { buffer, fileName, mimeType } =
        await this.documentService.getDocumentContent(id);

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(fileName)}"`,
      );
      res.setHeader('Content-Type', mimeType || 'application/octet-stream');
      res.send(buffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new BadRequestException('Error downloading document');
      }
    }
  }

  @Get('file/:id')
  async downloadDocumentSimple(
    @Param('id') documentId: string,
    @Res() res: Response,
  ) {
    try {
      const id = parseInt(documentId, 10);

      if (isNaN(id)) {
        throw new BadRequestException('Document ID must be a number');
      }

      const { buffer, fileName, mimeType } =
        await this.documentService.getDocumentContent(id);

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(fileName)}"`,
      );
      res.setHeader('Content-Type', mimeType || 'application/octet-stream');
      res.send(buffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new BadRequestException('Error downloading document');
      }
    }
  }

  @Get('download/:entityType/:entityId')
  async downloadDocumentsByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseIntPipe) entityId: number,
    @Res() res: Response,
  ) {
    try {
      const documents = await this.documentService.getDocumentsByEntity(
        entityType,
        entityId,
      );

      if (documents.length === 0) {
        throw new NotFoundException(
          `No documents found for ${entityType} with ID ${entityId}`,
        );
      }

      const zip = new JSZip();
      documents.forEach((doc) => {
        const filePath = doc.filePath;
        if (existsSync(filePath)) {
          const fileContent = readFileSync(filePath);
          zip.file(doc.originalFileName, fileContent);
        }
      });

      const content = await zip.generateAsync({ type: 'nodebuffer' });
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=documents.zip',
      );
      res.setHeader('Content-Type', 'application/zip');
      res.send(content);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new BadRequestException('Error downloading documents');
      }
    }
  }

  @Delete(':documentId')
  async deleteDocument(@Param('documentId', ParseIntPipe) documentId: number) {
    try {
      return await this.documentService.deleteDocument(documentId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new BadRequestException('Error deleting document');
      }
    }
  }

  private getEntityType(document: any): string {
    if (document.eventId) return 'event';
    if (document.demandeId) return 'demande';
    if (document.authorizationId) return 'authorization';
    if (document.commentId) return 'comment';
    return 'unknown';
  }
}
