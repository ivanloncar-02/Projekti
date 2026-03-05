import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  STUDENT_ASSIGNED = 'STUDENT_ASSIGNED',
  DIARY_ENTRY_SUBMITTED = 'DIARY_ENTRY_SUBMITTED',
  FINAL_REPORT_SUBMITTED = 'FINAL_REPORT_SUBMITTED',
  APPLICATION_STATUS = 'APPLICATION_STATUS',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'uuid', nullable: true })
  relatedId: string;

  @Column({ nullable: true })
  relatedUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
