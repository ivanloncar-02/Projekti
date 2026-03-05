import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Internship } from './entities/internship.entity';
import { Company } from '../companies/entities/company.entity';
import { Application } from '../applications/entities/application.entity';
import { AcademicMentor } from '../mentors/entities/academic-mentor.entity';
import { CompanyMentorEvaluation } from '../evaluations/entities/company-mentor-evaluation.entity';
import { InternshipsController } from './internships.controller';
import { InternshipsService } from './internships.service';
import { AdminInternshipsController } from './admin-internships.controller';
import { AdminInternshipsService } from './admin-internships.service';
import { PublicInternshipsController } from './public-internships.controller';
import { EvaluationsModule } from '../evaluations/evaluations.module';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Internship,
      Company,
      Application,
      AcademicMentor,
      CompanyMentorEvaluation,
    ]),
    EvaluationsModule,
    ApplicationsModule,
  ],
  controllers: [
    InternshipsController,
    AdminInternshipsController,
    PublicInternshipsController,
  ],
  providers: [InternshipsService, AdminInternshipsService],
  exports: [TypeOrmModule, InternshipsService, AdminInternshipsService],
})
export class InternshipsModule {}
