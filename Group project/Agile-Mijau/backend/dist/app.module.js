"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const users_module_1 = require("./modules/users/users.module");
const auth_module_1 = require("./modules/auth/auth.module");
const database_config_1 = require("./database/database.config");
const students_module_1 = require("./modules/students/students.module");
const mentors_module_1 = require("./modules/mentors/mentors.module");
const companies_module_1 = require("./modules/companies/companies.module");
const internships_module_1 = require("./modules/internships/internships.module");
const applications_module_1 = require("./modules/applications/applications.module");
const evaluations_module_1 = require("./modules/evaluations/evaluations.module");
const goals_module_1 = require("./modules/goals/goals.module");
const diary_module_1 = require("./modules/diary/diary.module");
const admin_module_1 = require("./modules/admin/admin.module");
const statistics_module_1 = require("./modules/statistics/statistics.module");
const email_module_1 = require("./modules/email/email.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const uploads_module_1 = require("./modules/uploads/uploads.module");
const reports_module_1 = require("./modules/reports/reports.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: database_config_1.getDatabaseConfig,
                inject: [config_1.ConfigService],
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            students_module_1.StudentsModule,
            mentors_module_1.MentorsModule,
            companies_module_1.CompaniesModule,
            internships_module_1.InternshipsModule,
            applications_module_1.ApplicationsModule,
            evaluations_module_1.EvaluationsModule,
            goals_module_1.GoalsModule,
            diary_module_1.DiaryModule,
            admin_module_1.AdminModule,
            statistics_module_1.StatisticsModule,
            email_module_1.EmailModule,
            dashboard_module_1.DashboardModule,
            notifications_module_1.NotificationsModule,
            uploads_module_1.UploadsModule,
            reports_module_1.ReportsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map