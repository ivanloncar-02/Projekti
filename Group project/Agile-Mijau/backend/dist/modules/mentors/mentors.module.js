"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentorsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const academic_mentor_entity_1 = require("./entities/academic-mentor.entity");
const student_entity_1 = require("../students/entities/student.entity");
const goal_entity_1 = require("../goals/entities/goal.entity");
const diary_entry_entity_1 = require("../diary/entities/diary-entry.entity");
const application_entity_1 = require("../applications/entities/application.entity");
const mentors_service_1 = require("./mentors.service");
const mentors_controller_1 = require("./mentors.controller");
const users_module_1 = require("../users/users.module");
let MentorsModule = class MentorsModule {
};
exports.MentorsModule = MentorsModule;
exports.MentorsModule = MentorsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([academic_mentor_entity_1.AcademicMentor, student_entity_1.Student, goal_entity_1.Goal, diary_entry_entity_1.DiaryEntry, application_entity_1.Application]),
            users_module_1.UsersModule,
        ],
        controllers: [mentors_controller_1.MentorsController],
        providers: [mentors_service_1.MentorsService],
        exports: [typeorm_1.TypeOrmModule, mentors_service_1.MentorsService],
    })
], MentorsModule);
//# sourceMappingURL=mentors.module.js.map