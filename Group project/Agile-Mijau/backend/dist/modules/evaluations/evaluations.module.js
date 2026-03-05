"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const company_mentor_evaluation_entity_1 = require("./entities/company-mentor-evaluation.entity");
const internship_entity_1 = require("../internships/entities/internship.entity");
const company_mentor_entity_1 = require("../mentors/entities/company-mentor.entity");
const application_entity_1 = require("../applications/entities/application.entity");
const evaluations_service_1 = require("./evaluations.service");
const evaluations_controller_1 = require("./evaluations.controller");
let EvaluationsModule = class EvaluationsModule {
};
exports.EvaluationsModule = EvaluationsModule;
exports.EvaluationsModule = EvaluationsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([company_mentor_evaluation_entity_1.CompanyMentorEvaluation, internship_entity_1.Internship, company_mentor_entity_1.CompanyMentor, application_entity_1.Application])],
        controllers: [evaluations_controller_1.EvaluationsController],
        providers: [evaluations_service_1.EvaluationsService],
        exports: [typeorm_1.TypeOrmModule, evaluations_service_1.EvaluationsService],
    })
], EvaluationsModule);
//# sourceMappingURL=evaluations.module.js.map