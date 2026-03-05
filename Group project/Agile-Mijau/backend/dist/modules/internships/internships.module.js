"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternshipsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const internship_entity_1 = require("./entities/internship.entity");
const company_entity_1 = require("../companies/entities/company.entity");
const application_entity_1 = require("../applications/entities/application.entity");
const academic_mentor_entity_1 = require("../mentors/entities/academic-mentor.entity");
const company_mentor_evaluation_entity_1 = require("../evaluations/entities/company-mentor-evaluation.entity");
const internships_controller_1 = require("./internships.controller");
const internships_service_1 = require("./internships.service");
const admin_internships_controller_1 = require("./admin-internships.controller");
const admin_internships_service_1 = require("./admin-internships.service");
const public_internships_controller_1 = require("./public-internships.controller");
const evaluations_module_1 = require("../evaluations/evaluations.module");
const applications_module_1 = require("../applications/applications.module");
let InternshipsModule = class InternshipsModule {
};
exports.InternshipsModule = InternshipsModule;
exports.InternshipsModule = InternshipsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                internship_entity_1.Internship,
                company_entity_1.Company,
                application_entity_1.Application,
                academic_mentor_entity_1.AcademicMentor,
                company_mentor_evaluation_entity_1.CompanyMentorEvaluation,
            ]),
            evaluations_module_1.EvaluationsModule,
            applications_module_1.ApplicationsModule,
        ],
        controllers: [
            internships_controller_1.InternshipsController,
            admin_internships_controller_1.AdminInternshipsController,
            public_internships_controller_1.PublicInternshipsController,
        ],
        providers: [internships_service_1.InternshipsService, admin_internships_service_1.AdminInternshipsService],
        exports: [typeorm_1.TypeOrmModule, internships_service_1.InternshipsService, admin_internships_service_1.AdminInternshipsService],
    })
], InternshipsModule);
//# sourceMappingURL=internships.module.js.map