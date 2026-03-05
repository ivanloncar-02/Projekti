import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Student } from '../students/entities/student.entity';
import { Application } from '../applications/entities/application.entity';
import { Internship } from '../internships/entities/internship.entity';
import { Company } from '../companies/entities/company.entity';
import { DiaryEntry } from '../diary/entities/diary-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Application, Internship, Company, DiaryEntry]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
