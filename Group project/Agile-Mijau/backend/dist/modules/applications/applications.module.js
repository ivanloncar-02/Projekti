"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const application_entity_1 = require("./entities/application.entity");
const internship_entity_1 = require("../internships/entities/internship.entity");
const user_entity_1 = require("../users/entities/user.entity");
const applications_controller_1 = require("./applications.controller");
const applications_service_1 = require("./applications.service");
const application_events_listener_1 = require("./listeners/application-events.listener");
const email_module_1 = require("../email/email.module");
const notifications_module_1 = require("../notifications/notifications.module");
let ApplicationsModule = class ApplicationsModule {
};
exports.ApplicationsModule = ApplicationsModule;
exports.ApplicationsModule = ApplicationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([application_entity_1.Application, internship_entity_1.Internship, user_entity_1.User]),
            email_module_1.EmailModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [applications_controller_1.ApplicationsController],
        providers: [applications_service_1.ApplicationsService, application_events_listener_1.ApplicationEventsListener],
        exports: [typeorm_1.TypeOrmModule, applications_service_1.ApplicationsService],
    })
], ApplicationsModule);
//# sourceMappingURL=applications.module.js.map