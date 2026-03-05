import { AppDataSource } from '../data-source';
import { User } from '../../modules/users/entities/user.entity';
import { Company } from '../../modules/companies/entities/company.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

export async function seedCompanyMentor(dataSource = AppDataSource) {
  const userRepository = dataSource.getRepository(User);
  const companyRepository = dataSource.getRepository(Company);

  const existingMentor = await userRepository.findOne({
    where: { email: 'mentor@techfirma.hr' },
  });

  if (existingMentor) {
    console.log('- Company mentor already exists');
    return existingMentor;
  }

  // Find the company (should be created by seed-company first)
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
    role: UserRole.COMPANY_MENTOR,
    isActive: true,
    companyId: company.id,
  });

  await userRepository.save(mentor);
  console.log('✓ Company mentor created: mentor@techfirma.hr / MentorTvrtka123$');

  return mentor;
}

// Allow running standalone
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => seedCompanyMentor())
    .then(() => AppDataSource.destroy())
    .catch((error) => {
      console.error('Error seeding company mentor:', error);
      process.exit(1);
    });
}
