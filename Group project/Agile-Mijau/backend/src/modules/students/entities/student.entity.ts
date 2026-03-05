import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AcademicMentor } from '../../mentors/entities/academic-mentor.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true })
  userId: string;

  @OneToOne(() => User, user => user.student, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @Column({ unique: true })
  studentNumber: string;

  @Column()
  major: string;

  @Column()
  academicYear: string;

  @Column({ type: 'uuid', nullable: true })
  academicMentorId: string | null;

  @ManyToOne(() => AcademicMentor, mentor => mentor.students, { nullable: true })
  @JoinColumn({ name: 'academicMentorId' })
  academicMentor: AcademicMentor | null;

  @Column({ type: 'uuid', nullable: true })
  companyMentorId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'companyMentorId' })
  companyMentor: User | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', nullable: true })
  cv: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
