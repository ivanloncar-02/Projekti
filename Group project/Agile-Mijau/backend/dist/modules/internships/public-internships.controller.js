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
exports.PublicInternshipsController = void 0;
const common_1 = require("@nestjs/common");
const internships_service_1 = require("./internships.service");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let PublicInternshipsController = class PublicInternshipsController {
    internshipsService;
    constructor(internshipsService) {
        this.internshipsService = internshipsService;
    }
    findPublicInternships(page, limit) {
        return this.internshipsService.findPublicInternships(page, limit);
    }
    findOnePublic(id) {
        return this.internshipsService.findOnePublic(id);
    }
};
exports.PublicInternshipsController = PublicInternshipsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], PublicInternshipsController.prototype, "findPublicInternships", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicInternshipsController.prototype, "findOnePublic", null);
exports.PublicInternshipsController = PublicInternshipsController = __decorate([
    (0, common_1.Controller)('api/public/internships'),
    (0, public_decorator_1.Public)(),
    __metadata("design:paramtypes", [internships_service_1.InternshipsService])
], PublicInternshipsController);
//# sourceMappingURL=public-internships.controller.js.map