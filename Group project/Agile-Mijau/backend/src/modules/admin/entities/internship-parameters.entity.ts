import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('internship_parameters')
export class InternshipParameters {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  duration: number; // months

  @Column({ type: 'int' })
  requiredHours: number;

  @Column({ type: 'date' })
  applicationDeadline: Date;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isApprovalLocked: boolean;

  @Column({ type: 'text', nullable: true })
  approvalLockedReason: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
