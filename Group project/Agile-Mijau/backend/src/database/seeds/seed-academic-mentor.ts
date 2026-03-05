import { AppDataSource } from '../data-source';
import { User } from '../../modules/users/entities/user.entity';
import { AcademicMentor } from '../../modules/mentors/entities/academic-mentor.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

export async function seedAcademicMentor(dataSource = AppDataSource) {
  const userRepository = dataSource.getRepository(User);
  const academicMentorRepository = dataSource.getRepository(AcademicMentor);

  const existingMentor = await userRepository.findOne({
    where: { email: 'mentor@oss.unist.hr' },
  });

  if (existingMentor) {
    // Check if AcademicMentor entity exists, create if not
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
    } else {
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
    role: UserRole.ACADEMIC_MENTOR,
    isActive: true,
  });

  await userRepository.save(mentor);

  // Create corresponding AcademicMentor entity
  const academicMentor = academicMentorRepository.create({
    userId: mentor.id,
    department: 'Odjel za stručne studije',
    isActive: true,
  });
  await academicMentorRepository.save(academicMentor);

  console.log('✓ Academic mentor created: mentor@oss.unist.hr / Mentor123$');

  return mentor;
}

// Allow running standalone
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => seedAcademicMentor())
    .then(() => AppDataSource.destroy())
    .catch((error) => {
      console.error('Error seeding academic mentor:', error);
      process.exit(1);
    });
}
