import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Internship } from '../internships/entities/internship.entity';
import { DiaryEntry } from '../diary/entities/diary-entry.entity';
import { Goal } from '../goals/entities/goal.entity';
import { CompanyMentorEvaluation } from '../evaluations/entities/company-mentor-evaluation.entity';
import { Application } from '../applications/entities/application.entity';
import { Student } from '../students/entities/student.entity';
import { AcademicMentor } from '../mentors/entities/academic-mentor.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Internship,
      DiaryEntry,
      Goal,
      CompanyMentorEvaluation,
      Application,
      Student,
      AcademicMentor,
    ]),
    NotificationsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
