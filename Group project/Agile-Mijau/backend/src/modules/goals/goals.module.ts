import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goal } from './entities/goal.entity';
import { AcademicMentor } from '../mentors/entities/academic-mentor.entity';
import { CompanyMentor } from '../mentors/entities/company-mentor.entity';
import { Student } from '../students/entities/student.entity';
import { Application } from '../applications/entities/application.entity';
import { Internship } from '../internships/entities/internship.entity';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';

@Module({
  imports: [TypeOrmModule.forFeature([Goal, AcademicMentor, CompanyMentor, Student, Application, Internship])],
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [TypeOrmModule, GoalsService],
})
export class GoalsModule {}
