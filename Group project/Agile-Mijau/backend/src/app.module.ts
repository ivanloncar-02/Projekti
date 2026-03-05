import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { getDatabaseConfig } from './database/database.config';
import { StudentsModule } from './modules/students/students.module';
import { MentorsModule } from './modules/mentors/mentors.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { InternshipsModule } from './modules/internships/internships.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { EvaluationsModule } from './modules/evaluations/evaluations.module';
import { GoalsModule } from './modules/goals/goals.module';
import { DiaryModule } from './modules/diary/diary.module';
import { AdminModule } from './modules/admin/admin.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { EmailModule } from './modules/email/email.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    UsersModule,
    AuthModule,
    StudentsModule,
    MentorsModule,
    CompaniesModule,
    InternshipsModule,
    ApplicationsModule,
    EvaluationsModule,
    GoalsModule,
    DiaryModule,
    AdminModule,
    StatisticsModule,
    EmailModule,
    DashboardModule,
    NotificationsModule,
    UploadsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
