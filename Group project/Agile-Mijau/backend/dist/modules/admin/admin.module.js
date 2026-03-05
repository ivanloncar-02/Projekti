"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const internship_parameters_controller_1 = require("./internship-parameters.controller");
const internship_parameters_service_1 = require("./internship-parameters.service");
const internship_parameters_entity_1 = require("./entities/internship-parameters.entity");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const student_entity_1 = require("../students/entities/student.entity");
const academic_mentor_entity_1 = require("../mentors/entities/academic-mentor.entity");
const user_entity_1 = require("../users/entities/user.entity");
const application_entity_1 = require("../applications/entities/application.entity");
const notifications_module_1 = require("../notifications/notifications.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                internship_parameters_entity_1.InternshipParameters,
                student_entity_1.Student,
                academic_mentor_entity_1.AcademicMentor,
                user_entity_1.User,
                application_entity_1.Application,
            ]),
            notifications_module_1.NotificationsModule,
        ],
        controllers: [internship_parameters_controller_1.InternshipParametersController, admin_controller_1.AdminController],
        providers: [internship_parameters_service_1.InternshipParametersService, admin_service_1.AdminService],
        exports: [internship_parameters_service_1.InternshipParametersService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map