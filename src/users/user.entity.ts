import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { USER_ROLE } from './role.enum';
import { Event } from 'src/event/event.entity';
import { Demande } from 'src/demande/demande.entity';
import { Authorization } from 'src/authorization/authorization.entity';
import { Comment } from 'src/comment/comment.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Exclude({ toClassOnly: true })
  @Column({ nullable: false })
  password: string;

  @Exclude({ toClassOnly: true })
  @Column({ nullable: false })
  previousPassword: string;

  @Column({
    type: 'varchar',
    nullable: false,
    default: USER_ROLE.CITIZEN,
  })
  role: USER_ROLE;

  @Column({ type: 'date', nullable: false })
  birthDate: Date;

  @Column({ type: 'varchar', nullable: false, unique: true })
  phoneNumber: string;

  @Column({ type: 'varchar', nullable: true })
  @Index({ unique: true, where: '"cin" IS NOT NULL' })
  cin: string;

  @Column({ type: 'varchar', nullable: true })
  @Index({ unique: true, where: '"idAssociation" IS NOT NULL' })
  idAssociation: string;

  @Column({ type: 'varchar' })
  job: string;

  @Column({ type: 'varchar' })
  profile_photo: string;

  @Column({ type: 'boolean', default: false })
  locked: boolean;

  @OneToMany(() => Event, (event) => event.createdBy)
  events: Event[];

  @OneToMany(() => Demande, (demand) => demand.createdBy)
  demandes: Demande[];

  @OneToMany(() => Authorization, (authorization) => authorization.createdBy)
  authorizations: Authorization[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
