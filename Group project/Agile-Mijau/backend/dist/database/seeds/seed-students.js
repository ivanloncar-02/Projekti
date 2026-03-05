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
exports.seedStudents = seedStudents;
const data_source_1 = require("../data-source");
const user_entity_1 = require("../../modules/users/entities/user.entity");
const student_entity_1 = require("../../modules/students/entities/student.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const bcrypt = __importStar(require("bcrypt"));
const studentsData = [
    {
        user: {
            email: 'student1@oss.unist.hr',
            password: 'Student123$',
            firstName: 'Ante',
            lastName: 'Antić',
        },
        student: {
            studentNumber: '1234567890',
            major: 'Informacijske tehnologije',
            academicYear: '3. godina',
            phone: '+385 91 111 1111',
            address: 'Splitska 1, 21000 Split',
        },
    },
    {
        user: {
            email: 'student2@oss.unist.hr',
            password: 'Student123$',
            firstName: 'Marija',
            lastName: 'Marić',
        },
        student: {
            studentNumber: '2345678901',
            major: 'Informacijske tehnologije',
            academicYear: '3. godina',
            phone: '+385 92 222 2222',
            address: 'Dubrovačka 2, 21000 Split',
        },
    },
    {
        user: {
            email: 'student3@oss.unist.hr',
            password: 'Student123$',
            firstName: 'Ivan',
            lastName: 'Ivanović',
        },
        student: {
            studentNumber: '3456789012',
            major: 'Računarstvo',
            academicYear: '2. godina',
            phone: '+385 93 333 3333',
            address: 'Zadarska 3, 21000 Split',
        },
    },
    {
        user: {
            email: 'student4@oss.unist.hr',
            password: 'Student123$',
            firstName: 'Ana',
            lastName: 'Anić',
        },
        student: {
            studentNumber: '4567890123',
            major: 'Računarstvo',
            academicYear: '3. godina',
            phone: '+385 94 444 4444',
            address: 'Šibenska 4, 21000 Split',
        },
    },
    {
        user: {
            email: 'student5@oss.unist.hr',
            password: 'Student123$',
            firstName: 'Petra',
            lastName: 'Petrić',
        },
        student: {
            studentNumber: '5678901234',
            major: 'Informacijske tehnologije',
            academicYear: '2. godina',
            phone: '+385 95 555 5555',
            address: 'Trogirska 5, 21000 Split',
        },
    },
];
async function seedStudents(dataSource = data_source_1.AppDataSource) {
    const userRepository = dataSource.getRepository(user_entity_1.User);
    const studentRepository = dataSource.getRepository(student_entity_1.Student);
    const results = [];
    for (const data of studentsData) {
        const existingUser = await userRepository.findOne({
            where: { email: data.user.email },
        });
        if (existingUser) {
            console.log(`- Student ${data.user.email} already exists`);
            continue;
        }
        const hashedPassword = await bcrypt.hash(data.user.password, 10);
        const user = userRepository.create({
            email: data.user.email,
            password: hashedPassword,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            role: user_role_enum_1.UserRole.STUDENT,
            isActive: true,
        });
        await userRepository.save(user);
        const student = studentRepository.create({
            userId: user.id,
            studentNumber: data.student.studentNumber,
            major: data.student.major,
            academicYear: data.student.academicYear,
            phone: data.student.phone,
            address: data.student.address,
        });
        await studentRepository.save(student);
        user.studentId = student.id;
        await userRepository.save(user);
        console.log(`✓ Student created: ${data.user.email} / ${data.user.password}`);
        results.push({ user, student });
    }
    return results;
}
if (require.main === module) {
    data_source_1.AppDataSource.initialize()
        .then(() => seedStudents())
        .then(() => data_source_1.AppDataSource.destroy())
        .catch((error) => {
        console.error('Error seeding students:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=seed-students.js.map