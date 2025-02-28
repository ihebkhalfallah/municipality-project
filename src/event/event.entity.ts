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

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column()
  location: string;

  @Column({ nullable: false })
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
  documents: Document[];

  @ManyToOne(() => User, (user) => user.events)
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: User;

  @Column({ nullable: false })
  createdByUserId: number;

  @OneToMany(() => Comment, (comment) => comment.event)
  comments: Comment[];
}
