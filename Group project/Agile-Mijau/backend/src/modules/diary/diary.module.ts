import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiaryEntry } from './entities/diary-entry.entity';
import { CompanyMentor } from '../mentors/entities/company-mentor.entity';
import { AcademicMentor } from '../mentors/entities/academic-mentor.entity';
import { Student } from '../students/entities/student.entity';
import { Application } from '../applications/entities/application.entity';
import { Internship } from '../internships/entities/internship.entity';
import { DiaryService } from './diary.service';
import { DiaryController } from './diary.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DiaryEntry, CompanyMentor, AcademicMentor, Student, Application, Internship]),
    NotificationsModule,
  ],
  controllers: [DiaryController],
  providers: [DiaryService],
  exports: [TypeOrmModule, DiaryService],
})
export class DiaryModule {}
