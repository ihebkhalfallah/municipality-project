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

@Entity()
export class Authorization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  name: string;

  @Column({ type: 'varchar', charset: 'utf8', collation: 'utf8_general_ci' })
  description: string;

  @Column({ nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
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
  documents: Document[];
}
