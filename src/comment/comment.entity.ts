import { Authorization } from 'src/authorization/authorization.entity';
import { Demande } from 'src/demande/demande.entity';
import { Document } from 'src/documents/documents.entity';
import { Event } from 'src/event/event.entity';
import { User } from 'src/users/user.entity';
import { MaxTotalFileSize } from '../common/decorators/total-file-size.decorator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  commentText: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: false })
  userId: number;

  @ManyToOne(() => Event, (event) => event.comments, { nullable: true })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ nullable: true })
  eventId: number;

  @ManyToOne(() => Demande, (demande) => demande.comments, { nullable: true })
  @JoinColumn({ name: 'demandeId' })
  demande: Demande;

  @Column({ nullable: true })
  demandeId: number;

  @ManyToOne(() => Authorization, (authorization) => authorization.comments, {
    nullable: true,
  })
  @JoinColumn({ name: 'authorizationId' })
  authorization: Authorization;

  @Column({ nullable: true })
  authorizationId: number;

  @OneToMany(() => Document, (document) => document.comment)
  @MaxTotalFileSize(10, {
    message: 'Total size of all files in a comment cannot exceed 10MB',
  })
  documents: Document[];
}
