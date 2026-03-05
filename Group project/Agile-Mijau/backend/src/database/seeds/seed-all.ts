import { AppDataSource } from '../data-source';
import { seedAdmin } from './seed-admin';
import { seedAcademicMentor } from './seed-academic-mentor';
import { seedCompany } from './seed-company';
import { seedStudents } from './seed-students';
import { seedInternships } from './seed-internships';

async function seedAll() {
  await AppDataSource.initialize();
  console.log('Database connected\n');

  await seedAdmin(AppDataSource);
  await seedAcademicMentor(AppDataSource);
  await seedCompany(AppDataSource); // Creates companies with employers and company mentors
  await seedStudents(AppDataSource);
  await seedInternships(AppDataSource);

  console.log('\nSeeding complete!');
  await AppDataSource.destroy();
}

seedAll().catch((error) => {
  console.error('Error seeding:', error);
  process.exit(1);
});
