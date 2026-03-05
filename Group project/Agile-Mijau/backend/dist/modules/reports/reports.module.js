"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reports_controller_1 = require("./reports.controller");
const reports_service_1 = require("./reports.service");
const internship_entity_1 = require("../internships/entities/internship.entity");
const diary_entry_entity_1 = require("../diary/entities/diary-entry.entity");
const goal_entity_1 = require("../goals/entities/goal.entity");
const company_mentor_evaluation_entity_1 = require("../evaluations/entities/company-mentor-evaluation.entity");
const application_entity_1 = require("../applications/entities/application.entity");
const student_entity_1 = require("../students/entities/student.entity");
const academic_mentor_entity_1 = require("../mentors/entities/academic-mentor.entity");
const notifications_module_1 = require("../notifications/notifications.module");
let ReportsModule = class ReportsModule {
};
exports.ReportsModule = ReportsModule;
exports.ReportsModule = ReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                internship_entity_1.Internship,
                diary_entry_entity_1.DiaryEntry,
                goal_entity_1.Goal,
                company_mentor_evaluation_entity_1.CompanyMentorEvaluation,
                application_entity_1.Application,
                student_entity_1.Student,
                academic_mentor_entity_1.AcademicMentor,
            ]),
            notifications_module_1.NotificationsModule,
        ],
        controllers: [reports_controller_1.ReportsController],
        providers: [reports_service_1.ReportsService],
        exports: [reports_service_1.ReportsService],
    })
], ReportsModule);
//# sourceMappingURL=reports.module.js.map