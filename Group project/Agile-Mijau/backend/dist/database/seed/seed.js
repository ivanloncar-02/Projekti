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
exports.runSeed = runSeed;
const bcrypt = __importStar(require("bcrypt"));
const user_role_enum_1 = require("../../common/enums/user-role.enum");
async function runSeed(dataSource) {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
        console.log('🌱 Starting database seed...');
        const hashedPassword = await bcrypt.hash('Admin1234', 10);
        const existingAdmin = await queryRunner.query(`SELECT id FROM users WHERE email = $1`, ['admin@agile-mijau.hr']);
        if (existingAdmin.length === 0) {
            await queryRunner.query(`INSERT INTO users (id, email, password, "first_name", "last_name", role, phone, "created_at", "updated_at")
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, NOW(), NOW())`, [
                'admin@agile-mijau.hr',
                hashedPassword,
                'Admin',
                'User',
                user_role_enum_1.UserRole.ADMIN,
                '+385991234567',
            ]);
            console.log('✅ Admin user created: admin@agile-mijau.hr');
        }
        else {
            console.log('⚠️  Admin user already exists, skipping...');
        }
        const existingMentor1 = await queryRunner.query(`SELECT id FROM users WHERE email = $1`, ['mentor1@agile-mijau.hr']);
        if (existingMentor1.length === 0) {
            const [mentor1User] = await queryRunner.query(`INSERT INTO users (id, email, password, "first_name", "last_name", role, phone, "created_at", "updated_at")
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id`, [
                'mentor1@agile-mijau.hr',
                hashedPassword,
                'Marko',
                'Marković',
                user_role_enum_1.UserRole.ACADEMIC_MENTOR,
                '+385992345678',
            ]);
            await queryRunner.query(`INSERT INTO academic_mentors (id, "userId", department, "createdAt", "updatedAt")
         VALUES (uuid_generate_v4(), $1, $2, NOW(), NOW())`, [
                mentor1User.id,
                'Faculty of Engineering',
            ]);
            console.log('✅ Academic Mentor 1 created: mentor1@agile-mijau.hr');
        }
        else {
            console.log('⚠️  Academic Mentor 1 already exists, skipping...');
        }
        const existingMentor2 = await queryRunner.query(`SELECT id FROM users WHERE email = $1`, ['mentor2@agile-mijau.hr']);
        if (existingMentor2.length === 0) {
            const [mentor2User] = await queryRunner.query(`INSERT INTO users (id, email, password, "first_name", "last_name", role, phone, "created_at", "updated_at")
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id`, [
                'mentor2@agile-mijau.hr',
                hashedPassword,
                'Ana',
                'Anić',
                user_role_enum_1.UserRole.ACADEMIC_MENTOR,
                '+385993456789',
            ]);
            await queryRunner.query(`INSERT INTO academic_mentors (id, "userId", department, "createdAt", "updatedAt")
         VALUES (uuid_generate_v4(), $1, $2, NOW(), NOW())`, [
                mentor2User.id,
                'Faculty of Computer Science',
            ]);
            console.log('✅ Academic Mentor 2 created: mentor2@agile-mijau.hr');
        }
        else {
            console.log('⚠️  Academic Mentor 2 already exists, skipping...');
        }
        console.log('🎉 Seed completed successfully!');
    }
    catch (error) {
        console.error('❌ Seed failed:', error);
        throw error;
    }
    finally {
        await queryRunner.release();
    }
}
//# sourceMappingURL=seed.js.map