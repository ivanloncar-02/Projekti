import { AppDataSource } from '../data-source';
import { User } from '../../modules/users/entities/user.entity';
import { Student } from '../../modules/students/entities/student.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

interface StudentData {
  user: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
  student: {
    studentNumber: string;
    major: string;
    academicYear: string;
    phone?: string;
    address?: string;
  };
}

const studentsData: StudentData[] = [
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

export async function seedStudents(dataSource = AppDataSource) {
  const userRepository = dataSource.getRepository(User);
  const studentRepository = dataSource.getRepository(Student);

  const results: { user: User; student: Student }[] = [];

  for (const data of studentsData) {
    // Check if student already exists
    const existingUser = await userRepository.findOne({
      where: { email: data.user.email },
    });

    if (existingUser) {
      console.log(`- Student ${data.user.email} already exists`);
      continue;
    }

    // Create user first (without studentId)
    const hashedPassword = await bcrypt.hash(data.user.password, 10);
    const user = userRepository.create({
      email: data.user.email,
      password: hashedPassword,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      role: UserRole.STUDENT,
      isActive: true,
    });
    await userRepository.save(user);

    // Create student entity with userId
    const student = studentRepository.create({
      userId: user.id,
      studentNumber: data.student.studentNumber,
      major: data.student.major,
      academicYear: data.student.academicYear,
      phone: data.student.phone,
      address: data.student.address,
    });
    await studentRepository.save(student);

    // Update user with studentId reference
    user.studentId = student.id;
    await userRepository.save(user);

    console.log(`✓ Student created: ${data.user.email} / ${data.user.password}`);
    results.push({ user, student });
  }

  return results;
}

// Allow running standalone
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => seedStudents())
    .then(() => AppDataSource.destroy())
    .catch((error) => {
      console.error('Error seeding students:', error);
      process.exit(1);
    });
}
