"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInternshipDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_internship_dto_1 = require("./create-internship.dto");
class UpdateInternshipDto extends (0, mapped_types_1.PartialType)(create_internship_dto_1.CreateInternshipDto) {
}
exports.UpdateInternshipDto = UpdateInternshipDto;
//# sourceMappingURL=update-internship.dto.js.map