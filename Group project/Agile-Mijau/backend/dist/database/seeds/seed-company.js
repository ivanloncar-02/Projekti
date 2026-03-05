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
exports.seedCompany = seedCompany;
const data_source_1 = require("../data-source");
const user_entity_1 = require("../../modules/users/entities/user.entity");
const company_entity_1 = require("../../modules/companies/entities/company.entity");
const company_mentor_entity_1 = require("../../modules/mentors/entities/company-mentor.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const bcrypt = __importStar(require("bcrypt"));
const companiesData = [
    {
        company: {
            name: 'Tech Firma d.o.o.',
            oib: '12345678901',
            email: 'info@techfirma.hr',
            address: 'Vukovarska 123, 21000 Split',
            website: 'https://techfirma.hr',
            phone: '+385 21 123 456',
            contactPerson: 'Marko Novak',
        },
        employer: {
            email: 'employer@techfirma.hr',
            password: 'Employer123$',
            firstName: 'Marko',
            lastName: 'Novak',
        },
        mentor: {
            email: 'mentor@techfirma.hr',
            password: 'MentorTvrtka123$',
            firstName: 'Petar',
            lastName: 'Petrović',
        },
    },
    {
        company: {
            name: 'Infobip d.o.o.',
            oib: '23456789012',
            email: 'info@infobip.com',
            address: 'Ivana Lučića 2a, 10000 Zagreb',
            website: 'https://infobip.com',
            phone: '+385 1 234 567',
            contactPerson: 'Ana Kovač',
        },
        employer: {
            email: 'employer@infobip.com',
            password: 'Employer123$',
            firstName: 'Ana',
            lastName: 'Kovač',
        },
        mentor: {
            email: 'mentor@infobip.com',
            password: 'MentorTvrtka123$',
            firstName: 'Luka',
            lastName: 'Babić',
        },
    },
    {
        company: {
            name: 'Rimac Technology d.o.o.',
            oib: '34567890123',
            email: 'info@rimac-technology.com',
            address: 'Vele Lučice 6, 10000 Zagreb',
            website: 'https://rimac-technology.com',
            phone: '+385 1 345 678',
            contactPerson: 'Ivan Jurić',
        },
        employer: {
            email: 'employer@rimac.com',
            password: 'Employer123$',
            firstName: 'Ivan',
            lastName: 'Jurić',
        },
        mentor: {
            email: 'mentor@rimac.com',
            password: 'MentorTvrtka123$',
            firstName: 'Maja',
            lastName: 'Šimić',
        },
    },
];
async function seedCompany(dataSource = data_source_1.AppDataSource) {
    const userRepository = dataSource.getRepository(user_entity_1.User);
    const companyRepository = dataSource.getRepository(company_entity_1.Company);
    const companyMentorRepository = dataSource.getRepository(company_mentor_entity_1.CompanyMentor);
    const results = [];
    for (const data of companiesData) {
        const existingEmployer = await userRepository.findOne({
            where: { email: data.employer.email },
        });
        if (existingEmployer) {
            console.log(`- Company ${data.company.name} already exists`);
            continue;
        }
        const company = companyRepository.create(data.company);
        await companyRepository.save(company);
        console.log(`✓ Company created: ${data.company.name}`);
        const hashedEmployerPassword = await bcrypt.hash(data.employer.password, 10);
        const employer = userRepository.create({
            email: data.employer.email,
            password: hashedEmployerPassword,
            firstName: data.employer.firstName,
            lastName: data.employer.lastName,
            role: user_role_enum_1.UserRole.EMPLOYER,
            isActive: true,
            companyId: company.id,
        });
        await userRepository.save(employer);
        console.log(`✓ Employer created: ${data.employer.email} / ${data.employer.password}`);
        const hashedMentorPassword = await bcrypt.hash(data.mentor.password, 10);
        const mentorUser = userRepository.create({
            email: data.mentor.email,
            password: hashedMentorPassword,
            firstName: data.mentor.firstName,
            lastName: data.mentor.lastName,
            role: user_role_enum_1.UserRole.COMPANY_MENTOR,
            isActive: true,
            companyId: company.id,
        });
        await userRepository.save(mentorUser);
        const companyMentor = companyMentorRepository.create({
            userId: mentorUser.id,
            companyId: company.id,
            isActive: true,
        });
        await companyMentorRepository.save(companyMentor);
        console.log(`✓ Company mentor created: ${data.mentor.email} / ${data.mentor.password}`);
        results.push({ company, employer, mentor: mentorUser });
    }
    return results;
}
if (require.main === module) {
    data_source_1.AppDataSource.initialize()
        .then(() => seedCompany())
        .then(() => data_source_1.AppDataSource.destroy())
        .catch((error) => {
        console.error('Error seeding company:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=seed-company.js.map