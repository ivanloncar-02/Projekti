import { AppDataSource } from '../data-source';
import { User } from '../../modules/users/entities/user.entity';
import { Company } from '../../modules/companies/entities/company.entity';
import { CompanyMentor } from '../../modules/mentors/entities/company-mentor.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

interface CompanyData {
  company: {
    name: string;
    oib: string;
    email: string;
    address: string;
    website: string;
    phone: string;
    contactPerson: string;
  };
  employer: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
  mentor: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
}

const companiesData: CompanyData[] = [
  {
    company: {
      name: 'Tech Firma d.o.o.',
      oib: '12345678901',
      email: 'info@techfirma.hr',
      address: 'Vukovarska 123, 21000 Split',
      website: 'https://techfirma.hr',
      phone: '+385 21 123 456',
      contactPerson: 'Marko Novak',
    },
    employer: {
      email: 'employer@techfirma.hr',
      password: 'Employer123$',
      firstName: 'Marko',
      lastName: 'Novak',
    },
    mentor: {
      email: 'mentor@techfirma.hr',
      password: 'MentorTvrtka123$',
      firstName: 'Petar',
      lastName: 'Petrović',
    },
  },
  {
    company: {
      name: 'Infobip d.o.o.',
      oib: '23456789012',
      email: 'info@infobip.com',
      address: 'Ivana Lučića 2a, 10000 Zagreb',
      website: 'https://infobip.com',
      phone: '+385 1 234 567',
      contactPerson: 'Ana Kovač',
    },
    employer: {
      email: 'employer@infobip.com',
      password: 'Employer123$',
      firstName: 'Ana',
      lastName: 'Kovač',
    },
    mentor: {
      email: 'mentor@infobip.com',
      password: 'MentorTvrtka123$',
      firstName: 'Luka',
      lastName: 'Babić',
    },
  },
  {
    company: {
      name: 'Rimac Technology d.o.o.',
      oib: '34567890123',
      email: 'info@rimac-technology.com',
      address: 'Vele Lučice 6, 10000 Zagreb',
      website: 'https://rimac-technology.com',
      phone: '+385 1 345 678',
      contactPerson: 'Ivan Jurić',
    },
    employer: {
      email: 'employer@rimac.com',
      password: 'Employer123$',
      firstName: 'Ivan',
      lastName: 'Jurić',
    },
    mentor: {
      email: 'mentor@rimac.com',
      password: 'MentorTvrtka123$',
      firstName: 'Maja',
      lastName: 'Šimić',
    },
  },
];

export async function seedCompany(dataSource = AppDataSource) {
  const userRepository = dataSource.getRepository(User);
  const companyRepository = dataSource.getRepository(Company);
  const companyMentorRepository = dataSource.getRepository(CompanyMentor);

  const results: { company: Company; employer: User; mentor: User }[] = [];

  for (const data of companiesData) {
    // Check if employer already exists
    const existingEmployer = await userRepository.findOne({
      where: { email: data.employer.email },
    });

    if (existingEmployer) {
      console.log(`- Company ${data.company.name} already exists`);
      continue;
    }

    // Create company
    const company = companyRepository.create(data.company);
    await companyRepository.save(company);
    console.log(`✓ Company created: ${data.company.name}`);

    // Create employer
    const hashedEmployerPassword = await bcrypt.hash(data.employer.password, 10);
    const employer = userRepository.create({
      email: data.employer.email,
      password: hashedEmployerPassword,
      firstName: data.employer.firstName,
      lastName: data.employer.lastName,
      role: UserRole.EMPLOYER,
      isActive: true,
      companyId: company.id,
    });
    await userRepository.save(employer);
    console.log(`✓ Employer created: ${data.employer.email} / ${data.employer.password}`);

    // Create company mentor user
    const hashedMentorPassword = await bcrypt.hash(data.mentor.password, 10);
    const mentorUser = userRepository.create({
      email: data.mentor.email,
      password: hashedMentorPassword,
      firstName: data.mentor.firstName,
      lastName: data.mentor.lastName,
      role: UserRole.COMPANY_MENTOR,
      isActive: true,
      companyId: company.id,
    });
    await userRepository.save(mentorUser);

    // Create CompanyMentor entity
    const companyMentor = companyMentorRepository.create({
      userId: mentorUser.id,
      companyId: company.id,
      isActive: true,
    });
    await companyMentorRepository.save(companyMentor);
    console.log(`✓ Company mentor created: ${data.mentor.email} / ${data.mentor.password}`);

    results.push({ company, employer, mentor: mentorUser });
  }

  return results;
}

// Allow running standalone
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => seedCompany())
    .then(() => AppDataSource.destroy())
    .catch((error) => {
      console.error('Error seeding company:', error);
      process.exit(1);
    });
}
