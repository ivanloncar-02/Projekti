import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyMentorEvaluation } from './entities/company-mentor-evaluation.entity';
import { Internship } from '../internships/entities/internship.entity';
import { CompanyMentor } from '../mentors/entities/company-mentor.entity';
import { Application } from '../applications/entities/application.entity';
import { EvaluationsService } from './evaluations.service';
import { EvaluationsController } from './evaluations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyMentorEvaluation, Internship, CompanyMentor, Application])],
  controllers: [EvaluationsController],
  providers: [EvaluationsService],
  exports: [TypeOrmModule, EvaluationsService],
})
export class EvaluationsModule {}
