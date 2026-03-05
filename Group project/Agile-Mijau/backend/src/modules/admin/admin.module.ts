import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternshipParametersController } from './internship-parameters.controller';
import { InternshipParametersService } from './internship-parameters.service';
import { InternshipParameters } from './entities/internship-parameters.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Student } from '../students/entities/student.entity';
import { AcademicMentor } from '../mentors/entities/academic-mentor.entity';
import { User } from '../users/entities/user.entity';
import { Application } from '../applications/entities/application.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InternshipParameters,
      Student,
      AcademicMentor,
      User,
      Application,
    ]),
    NotificationsModule,
  ],
  controllers: [InternshipParametersController, AdminController],
  providers: [InternshipParametersService, AdminService],
  exports: [InternshipParametersService],
})
export class AdminModule {}
