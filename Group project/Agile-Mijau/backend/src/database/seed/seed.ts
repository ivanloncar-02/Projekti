import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../common/enums/user-role.enum';

export async function runSeed(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    console.log('🌱 Starting database seed...');

    // Hash password for all users (password: Admin1234)
    const hashedPassword = await bcrypt.hash('Admin1234', 10);

    // 1. ADMIN USER
    const existingAdmin = await queryRunner.query(
      `SELECT id FROM users WHERE email = $1`,
      ['admin@agile-mijau.hr']
    );

    if (existingAdmin.length === 0) {
      // CHANGED: "firstName" -> "first_name", "lastName" -> "last_name", etc.
      await queryRunner.query(
        `INSERT INTO users (id, email, password, "first_name", "last_name", role, phone, "created_at", "updated_at")
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [
          'admin@agile-mijau.hr',
          hashedPassword,
          'Admin',
          'User',
          UserRole.ADMIN,
          '+385991234567',
        ]
      );
      console.log('✅ Admin user created: admin@agile-mijau.hr');
    } else {
      console.log('⚠️  Admin user already exists, skipping...');
    }

    // 2. ACADEMIC MENTOR 1
    const existingMentor1 = await queryRunner.query(
      `SELECT id FROM users WHERE email = $1`,
      ['mentor1@agile-mijau.hr']
    );

    if (existingMentor1.length === 0) {
      const [mentor1User] = await queryRunner.query(
        `INSERT INTO users (id, email, password, "first_name", "last_name", role, phone, "created_at", "updated_at")
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id`,
        [
          'mentor1@agile-mijau.hr',
          hashedPassword,
          'Marko',
          'Marković',
          UserRole.ACADEMIC_MENTOR,
          '+385992345678',
        ]
      );

      // Note: Make sure "office" column exists in academic_mentors, 
      // your logs only showed "department", "isActive", "createdAt", "updatedAt"
      await queryRunner.query(
        `INSERT INTO academic_mentors (id, "userId", department, "createdAt", "updatedAt")
         VALUES (uuid_generate_v4(), $1, $2, NOW(), NOW())`,
        [
          mentor1User.id,
          'Faculty of Engineering',
        ]
      );
      console.log('✅ Academic Mentor 1 created: mentor1@agile-mijau.hr');
    } else {
      console.log('⚠️  Academic Mentor 1 already exists, skipping...');
    }

    // 3. ACADEMIC MENTOR 2
    const existingMentor2 = await queryRunner.query(
      `SELECT id FROM users WHERE email = $1`,
      ['mentor2@agile-mijau.hr']
    );

    if (existingMentor2.length === 0) {
      const [mentor2User] = await queryRunner.query(
        `INSERT INTO users (id, email, password, "first_name", "last_name", role, phone, "created_at", "updated_at")
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id`,
        [
          'mentor2@agile-mijau.hr',
          hashedPassword,
          'Ana',
          'Anić',
          UserRole.ACADEMIC_MENTOR,
          '+385993456789',
        ]
      );

      await queryRunner.query(
        `INSERT INTO academic_mentors (id, "userId", department, "createdAt", "updatedAt")
         VALUES (uuid_generate_v4(), $1, $2, NOW(), NOW())`,
        [
          mentor2User.id,
          'Faculty of Computer Science',
        ]
      );
      console.log('✅ Academic Mentor 2 created: mentor2@agile-mijau.hr');
    } else {
      console.log('⚠️  Academic Mentor 2 already exists, skipping...');
    }

    console.log('🎉 Seed completed successfully!');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}