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
import { Student } from '../../students/entities/student.entity';
import { Internship } from '../../internships/entities/internship.entity';
import { CompanyMentor } from '../../mentors/entities/company-mentor.entity';

@Entity('diary_entries')
export class DiaryEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  studentId: string;

  @ManyToOne(() => Student, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ type: 'uuid' })
  @Index()
  internshipId: string;

  @ManyToOne(() => Internship, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'internshipId' })
  internship: Internship;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'text' })
  entry: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  hoursWorked: number;

  @Column({ default: false })
  approved: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string | null;

  @ManyToOne(() => CompanyMentor, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approvedBy' })
  approver: CompanyMentor | null;

  @Column({ type: 'text', nullable: true })
  mentorComment: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
