"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCompanyMentor = seedCompanyMentor;
const data_source_1 = require("../data-source");
const user_entity_1 = require("../../modules/users/entities/user.entity");
const company_entity_1 = require("../../modules/companies/entities/company.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const bcrypt = __importStar(require("bcrypt"));
async function seedCompanyMentor(dataSource = data_source_1.AppDataSource) {
    const userRepository = dataSource.getRepository(user_entity_1.User);
    const companyRepository = dataSource.getRepository(company_entity_1.Company);
    const existingMentor = await userRepository.findOne({
        where: { email: 'mentor@techfirma.hr' },
    });
    if (existingMentor) {
        console.log('- Company mentor already exists');
        return existingMentor;
    }
    const company = await companyRepository.findOne({
        where: { name: 'Tech Firma d.o.o.' },
    });
    if (!company) {
        console.log('- Company not found, skipping company mentor seed');
        return null;
    }
    const hashedPassword = await bcrypt.hash('MentorTvrtka123$', 10);
    const mentor = userRepository.create({
        email: 'mentor@techfirma.hr',
        password: hashedPassword,
        firstName: 'Petar',
        lastName: 'Petrović',
        role: user_role_enum_1.UserRole.COMPANY_MENTOR,
        isActive: true,
        companyId: company.id,
    });
    await userRepository.save(mentor);
    console.log('✓ Company mentor created: mentor@techfirma.hr / MentorTvrtka123$');
    return mentor;
}
if (require.main === module) {
    data_source_1.AppDataSource.initialize()
        .then(() => seedCompanyMentor())
        .then(() => data_source_1.AppDataSource.destroy())
        .catch((error) => {
        console.error('Error seeding company mentor:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=seed-company-mentor.js.map