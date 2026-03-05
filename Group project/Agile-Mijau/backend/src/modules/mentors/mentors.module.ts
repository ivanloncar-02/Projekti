import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicMentor } from './entities/academic-mentor.entity';
import { Student } from '../students/entities/student.entity';
import { Goal } from '../goals/entities/goal.entity';
import { DiaryEntry } from '../diary/entities/diary-entry.entity';
import { Application } from '../applications/entities/application.entity';
import { MentorsService } from './mentors.service';
import { MentorsController } from './mentors.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AcademicMentor, Student, Goal, DiaryEntry, Application]),
    UsersModule,
  ],
  controllers: [MentorsController],
  providers: [MentorsService],
  exports: [TypeOrmModule, MentorsService],
})
export class MentorsModule {}
