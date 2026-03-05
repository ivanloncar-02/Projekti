import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Internship } from '../../internships/entities/internship.entity';
import { CompanyMentor } from '../../mentors/entities/company-mentor.entity';

@Entity('company_mentor_evaluations')
@Unique(['internshipId'])
@Check(`"rating" BETWEEN 1 AND 5`)
@Check(`"technicalSkills" BETWEEN 1 AND 5`)
@Check(`"communication" BETWEEN 1 AND 5`)
@Check(`"workEthic" BETWEEN 1 AND 5`)
export class CompanyMentorEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  internshipId: string;

  @OneToOne(() => Internship, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'internshipId' })
  internship: Internship;

  @Index()
  @Column({ type: 'uuid' })
  mentorId: string;

  @ManyToOne(() => CompanyMentor, (mentor) => mentor.evaluations, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'mentorId' })
  mentor: CompanyMentor;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'int' })
  technicalSkills: number;

  @Column({ type: 'int' })
  communication: number;

  @Column({ type: 'int' })
  workEthic: number;

  @Column({ type: 'text', nullable: true })
  overallPerformance: string | null;

  @Column({ type: 'text', nullable: true })
  recommendations: string | null;

  @Column({ default: true })
  isLocked: boolean;

  @CreateDateColumn()
  submittedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
