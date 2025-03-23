import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { AUTHORIZATION_STATUS } from './authorization-status.enum';
import { Comment } from 'src/comment/comment.entity';
import { Document } from 'src/documents/documents.entity';
import { MaxTotalFileSize } from '../common/decorators/total-file-size.decorator';

@Entity()
export class Authorization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ nullable: false })
  location: string;

  @Column({ nullable: false })
  start_date: Date;

  @Column({ nullable: false })
  end_date: Date;

  @Column({ nullable: false })
  creation_date: Date;

  @Column({
    nullable: false,
    type: 'varchar',
    default: AUTHORIZATION_STATUS.PENDING,
  })
  status: AUTHORIZATION_STATUS;

  @ManyToOne(() => User, (user) => user.events)
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: User;

  @Column({ nullable: false })
  createdByUserId: number;

  @OneToMany(() => Comment, (comment) => comment.authorization)
  comments: Comment[];

  @OneToMany(() => Document, (document) => document.authorization)
  @MaxTotalFileSize(10, {
    message: 'Total size of all files in an authorization cannot exceed 10MB',
  })
  documents: Document[];
}
