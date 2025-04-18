import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EVENT_TYPE, EVENT_STATUS } from './event.enum';
import { User } from 'src/users/user.entity';
import { Comment } from 'src/comment/comment.entity';
import { Document } from 'src/documents/documents.entity';
import { MaxTotalFileSize } from '../common/decorators/total-file-size.decorator';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  name: string;

  @Column({ nullable: true, charset: 'utf8', collation: 'utf8_general_ci' })
  location: string;

  @Column({ nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  description: string;

  @Column({ nullable: false })
  date: Date;

  @Column({
    nullable: false,
    type: 'varchar',
    default: EVENT_TYPE.ANNOUNCEMENT,
  })
  type: EVENT_TYPE;

  @Column({
    nullable: false,
    type: 'varchar',
    default: EVENT_STATUS.PENDING,
  })
  status: EVENT_STATUS;

  @OneToMany(() => Document, (document) => document.event)
  @MaxTotalFileSize(10, {
    message: 'Total size of all files in an event cannot exceed 10MB',
  })
  documents: Document[];

  @ManyToOne(() => User, (user) => user.events)
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: User;

  @Column({ nullable: false })
  createdByUserId: number;

  @OneToMany(() => Comment, (comment) => comment.event)
  comments: Comment[];
}
