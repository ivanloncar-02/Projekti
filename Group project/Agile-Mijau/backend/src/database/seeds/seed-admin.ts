import { AppDataSource } from '../data-source';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

export async function seedAdmin(dataSource = AppDataSource) {
  const userRepository = dataSource.getRepository(User);

  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@oss.unist.hr' },
  });

  if (existingAdmin) {
    console.log('- Admin already exists');
    return existingAdmin;
  }

  const hashedPassword = await bcrypt.hash('Admin123$', 10);

  const admin = userRepository.create({
    email: 'admin@oss.unist.hr',
    password: hashedPassword,
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    isActive: true,
  });

  await userRepository.save(admin);
  console.log('✓ Admin created: admin@oss.unist.hr / Admin123$');

  return admin;
}

// Allow running standalone
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => seedAdmin())
    .then(() => AppDataSource.destroy())
    .catch((error) => {
      console.error('Error seeding admin:', error);
      process.exit(1);
    });
}
