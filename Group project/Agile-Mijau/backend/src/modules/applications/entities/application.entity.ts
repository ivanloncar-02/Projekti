import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Internship } from '../../internships/entities/internship.entity';
import { Student } from '../../students/entities/student.entity';
import { ApplicationStatus } from '../../../common/enums/application-status.enum';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  internshipId: string;

  @ManyToOne(() => Internship, (internship) => internship.applications, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'internshipId' })
  internship: Internship;

  @Index()
  @Column({ type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  @Index()
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  coverLetter: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  cvPath: string | null;

  @Column({ type: 'simple-array', nullable: true })
  documentsPaths: string[] | null;

  @Column({ type: 'timestamptz', nullable: true })
  statusChangedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  statusChangedBy: string | null;

  @CreateDateColumn()
  appliedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
