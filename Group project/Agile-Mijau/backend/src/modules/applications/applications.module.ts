import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { Internship } from '../internships/entities/internship.entity';
import { User } from '../users/entities/user.entity';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { ApplicationEventsListener } from './listeners/application-events.listener';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, Internship, User]),
    EmailModule,
    NotificationsModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, ApplicationEventsListener],
  exports: [TypeOrmModule, ApplicationsService],
})
export class ApplicationsModule {}
