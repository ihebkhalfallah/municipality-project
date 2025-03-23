import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from '../event/event.entity';
import { Demande } from '../demande/demande.entity';
import { Authorization } from '../authorization/authorization.entity';
import { Comment } from '../comment/comment.entity';
import { Max } from 'class-validator';

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filePath: string;

  @Column()
  originalFileName: string;

  @Column({ nullable: true })
  @Max(10 * 1024 * 1024, { message: 'File size cannot exceed 10MB' })
  fileSize: number;

  @Column({ nullable: true })
  mimeType: string;

  @Column()
  uploadDate: Date;

  @ManyToOne(() => Event, (event) => event.documents, { nullable: true })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ nullable: true })
  eventId: number;

  @ManyToOne(() => Demande, (demande) => demande.documents, { nullable: true })
  @JoinColumn({ name: 'demandeId' })
  demande: Demande;

  @Column({ nullable: true })
  demandeId: number;

  @ManyToOne(() => Authorization, (authorization) => authorization.documents, {
    nullable: true,
  })
  @JoinColumn({ name: 'authorizationId' })
  authorization: Authorization;

  @Column({ nullable: true })
  authorizationId: number;

  @ManyToOne(() => Comment, (comment) => comment.documents, { nullable: true })
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  @Column({ nullable: true })
  commentId: number;
}
