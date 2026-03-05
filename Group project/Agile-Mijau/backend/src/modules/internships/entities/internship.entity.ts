import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InternshipStatus } from '../../../common/enums/internship-status.enum';
import { Company } from '../../companies/entities/company.entity';
import { Application } from '../../applications/entities/application.entity';
import { User } from '../../users/entities/user.entity';

@Entity('internships')
@Index(['status'])
@Index(['companyId'])
@Index(['createdAt'])
export class Internship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.internships, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  location: string;

  @Column({ type: 'int' })
  duration: number; // months

  @Column({ type: 'int' })
  requiredHours: number;

  // Postgres text[]
  @Column({
    type: 'text',
    array: true,
    default: () => 'ARRAY[]::text[]',
  })
  requiredSkills: string[];

  @Column({ type: 'numeric', nullable: true })
  salary: number | null;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: InternshipStatus,
    default: InternshipStatus.DRAFT,
  })
  status: InternshipStatus;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approvedBy' })
  approver: User | null;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  archivedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  grade: number | null;

  @Column({ type: 'text', nullable: true })
  gradeComment: string | null;

  @Column({ type: 'uuid', nullable: true })
  gradedBy: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'gradedBy' })
  grader: User | null;

  @Column({ type: 'timestamptz', nullable: true })
  gradedAt: Date | null;

  @OneToMany(() => Application, (application) => application.internship)
  applications: Application[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
