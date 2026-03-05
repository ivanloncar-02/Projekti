"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiaryModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const diary_entry_entity_1 = require("./entities/diary-entry.entity");
const company_mentor_entity_1 = require("../mentors/entities/company-mentor.entity");
const academic_mentor_entity_1 = require("../mentors/entities/academic-mentor.entity");
const student_entity_1 = require("../students/entities/student.entity");
const application_entity_1 = require("../applications/entities/application.entity");
const internship_entity_1 = require("../internships/entities/internship.entity");
const diary_service_1 = require("./diary.service");
const diary_controller_1 = require("./diary.controller");
const notifications_module_1 = require("../notifications/notifications.module");
let DiaryModule = class DiaryModule {
};
exports.DiaryModule = DiaryModule;
exports.DiaryModule = DiaryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([diary_entry_entity_1.DiaryEntry, company_mentor_entity_1.CompanyMentor, academic_mentor_entity_1.AcademicMentor, student_entity_1.Student, application_entity_1.Application, internship_entity_1.Internship]),
            notifications_module_1.NotificationsModule,
        ],
        controllers: [diary_controller_1.DiaryController],
        providers: [diary_service_1.DiaryService],
        exports: [typeorm_1.TypeOrmModule, diary_service_1.DiaryService],
    })
], DiaryModule);
//# sourceMappingURL=diary.module.js.map