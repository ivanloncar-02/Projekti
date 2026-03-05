"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const seed_admin_1 = require("./seed-admin");
const seed_academic_mentor_1 = require("./seed-academic-mentor");
const seed_company_1 = require("./seed-company");
const seed_students_1 = require("./seed-students");
const seed_internships_1 = require("./seed-internships");
async function seedAll() {
    await data_source_1.AppDataSource.initialize();
    console.log('Database connected\n');
    await (0, seed_admin_1.seedAdmin)(data_source_1.AppDataSource);
    await (0, seed_academic_mentor_1.seedAcademicMentor)(data_source_1.AppDataSource);
    await (0, seed_company_1.seedCompany)(data_source_1.AppDataSource);
    await (0, seed_students_1.seedStudents)(data_source_1.AppDataSource);
    await (0, seed_internships_1.seedInternships)(data_source_1.AppDataSource);
    console.log('\nSeeding complete!');
    await data_source_1.AppDataSource.destroy();
}
seedAll().catch((error) => {
    console.error('Error seeding:', error);
    process.exit(1);
});
//# sourceMappingURL=seed-all.js.map