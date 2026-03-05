"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminInternshipsController = void 0;
const common_1 = require("@nestjs/common");
const admin_internships_service_1 = require("./admin-internships.service");
const internship_status_enum_1 = require("../../common/enums/internship-status.enum");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let AdminInternshipsController = class AdminInternshipsController {
    adminInternshipsService;
    constructor(adminInternshipsService) {
        this.adminInternshipsService = adminInternshipsService;
    }
    findAll(page, limit, year, student, company, status, search, sortBy, order) {
        return this.adminInternshipsService.findAllInternships({
            page,
            limit,
            year,
            student,
            company,
            status,
            search,
            sortBy,
            order,
        });
    }
};
exports.AdminInternshipsController = AdminInternshipsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('year', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('student')),
    __param(4, (0, common_1.Query)('company', new common_1.ParseUUIDPipe({ optional: true }))),
    __param(5, (0, common_1.Query)('status')),
    __param(6, (0, common_1.Query)('search')),
    __param(7, (0, common_1.Query)('sortBy')),
    __param(8, (0, common_1.Query)('order')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AdminInternshipsController.prototype, "findAll", null);
exports.AdminInternshipsController = AdminInternshipsController = __decorate([
    (0, common_1.Controller)('api/admin/internships'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [admin_internships_service_1.AdminInternshipsService])
], AdminInternshipsController);
//# sourceMappingURL=admin-internships.controller.js.map