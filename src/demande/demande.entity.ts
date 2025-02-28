import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { DEMANDE_STATUS, DEMANDE_TYPE } from './demande-status.enum';
import { Comment } from 'src/comment/comment.entity';
import { Document } from 'src/documents/documents.entity';
// import { Document } from 'src/documents/documents.entity';

@Entity()
export class Demande {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false })
  location: string;

  @Column({ nullable: false })
  date: Date;

  @Column({
    nullable: false,
    type: 'varchar',
    // default: DEMANDE_TYPE.,
  })
  type: DEMANDE_TYPE;

  @Column({
    nullable: false,
    type: 'varchar',
    default: DEMANDE_STATUS.PENDING,
  })
  status: DEMANDE_STATUS;

  @ManyToOne(() => User, (user) => user.events)
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: User;

  @Column({ nullable: false })
  createdByUserId: number;

  @OneToMany(() => Comment, (comment) => comment.demande)
  comments: Comment[];

  @OneToMany(() => Document, (document) => document.demande)
  documents: Document[];
}
