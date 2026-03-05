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
exports.seedAcademicMentor = seedAcademicMentor;
const data_source_1 = require("../data-source");
const user_entity_1 = require("../../modules/users/entities/user.entity");
const academic_mentor_entity_1 = require("../../modules/mentors/entities/academic-mentor.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const bcrypt = __importStar(require("bcrypt"));
async function seedAcademicMentor(dataSource = data_source_1.AppDataSource) {
    const userRepository = dataSource.getRepository(user_entity_1.User);
    const academicMentorRepository = dataSource.getRepository(academic_mentor_entity_1.AcademicMentor);
    const existingMentor = await userRepository.findOne({
        where: { email: 'mentor@oss.unist.hr' },
    });
    if (existingMentor) {
        const existingAcademicMentor = await academicMentorRepository.findOne({
            where: { userId: existingMentor.id },
        });
        if (!existingAcademicMentor) {
            const academicMentor = academicMentorRepository.create({
                userId: existingMentor.id,
                department: 'Odjel za stručne studije',
                isActive: true,
            });
            await academicMentorRepository.save(academicMentor);
            console.log('✓ AcademicMentor entity created for existing user');
        }
        else {
            console.log('- Academic mentor already exists');
        }
        return existingMentor;
    }
    const hashedPassword = await bcrypt.hash('Mentor123$', 10);
    const mentor = userRepository.create({
        email: 'mentor@oss.unist.hr',
        password: hashedPassword,
        firstName: 'Ivan',
        lastName: 'Horvat',
        role: user_role_enum_1.UserRole.ACADEMIC_MENTOR,
        isActive: true,
    });
    await userRepository.save(mentor);
    const academicMentor = academicMentorRepository.create({
        userId: mentor.id,
        department: 'Odjel za stručne studije',
        isActive: true,
    });
    await academicMentorRepository.save(academicMentor);
    console.log('✓ Academic mentor created: mentor@oss.unist.hr / Mentor123$');
    return mentor;
}
if (require.main === module) {
    data_source_1.AppDataSource.initialize()
        .then(() => seedAcademicMentor())
        .then(() => data_source_1.AppDataSource.destroy())
        .catch((error) => {
        console.error('Error seeding academic mentor:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=seed-academic-mentor.js.map