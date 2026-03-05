import { AppDataSource } from '../data-source';
import { Internship } from '../../modules/internships/entities/internship.entity';
import { Company } from '../../modules/companies/entities/company.entity';
import { InternshipStatus } from '../../common/enums/internship-status.enum';

interface InternshipData {
  title: string;
  description: string;
  location: string;
  duration: number;
  requiredHours: number;
  requiredSkills: string[];
  salary: number | null;
  startDate: Date;
  endDate: Date;
  status: InternshipStatus;
  companyName: string; // We'll use this to find the company
}

const internshipsData: InternshipData[] = [
  {
    title: 'Full Stack Developer Intern',
    description:
      'Prilika za rad na modernim web aplikacijama koristeći React, Node.js i TypeScript. Student će raditi na razvoju novih značajki, pisanju testova i održavanju postojećeg koda. Bit će uključen u cijeli razvojni proces od planiranja do deploymenta.',
    location: 'Split, Hrvatska',
    duration: 6,
    requiredHours: 300,
    requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Git'],
    salary: 3000,
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-08-31'),
    status: InternshipStatus.PUBLISHED,
    companyName: 'Tech Firma d.o.o.',
  },
  {
    title: 'Backend Developer Intern',
    description:
      'Rad na enterprise scale aplikacijama korištenjem NestJS, PostgreSQL i mikroservisa. Student će sudjelovati u razvoju RESTful API-ja, optimizaciji baze podataka i implementaciji novih backend značajki. Odličan uvid u arhitekturu velikih sustava.',
    location: 'Zagreb, Hrvatska',
    duration: 6,
    requiredHours: 300,
    requiredSkills: ['Node.js', 'NestJS', 'PostgreSQL', 'Docker', 'Microservices'],
    salary: 3500,
    startDate: new Date('2026-03-15'),
    endDate: new Date('2026-09-15'),
    status: InternshipStatus.PUBLISHED,
    companyName: 'Infobip d.o.o.',
  },
  {
    title: 'Mobile App Developer Intern',
    description:
      'Razvoj mobilnih aplikacija za iOS i Android koristeći React Native. Student će raditi na korisničkom sučelju, integraciji s API-jima i optimizaciji performansi mobilnih aplikacija. Prilika za učenje modernih mobile development praksi.',
    location: 'Zagreb, Hrvatska',
    duration: 5,
    requiredHours: 250,
    requiredSkills: ['React Native', 'JavaScript', 'Mobile Development', 'REST API'],
    salary: 2800,
    startDate: new Date('2026-04-01'),
    endDate: new Date('2026-08-31'),
    status: InternshipStatus.PUBLISHED,
    companyName: 'Infobip d.o.o.',
  },
  {
    title: 'DevOps Engineer Intern',
    description:
      'Sudjelovanje u održavanju CI/CD pipeline-a, automatizaciji infrastrukture i monitoring sustava. Student će raditi s Docker, Kubernetes, Jenkins i cloud platformama. Praktično iskustvo s najboljim DevOps praksama i alatima.',
    location: 'Zagreb, Hrvatska',
    duration: 6,
    requiredHours: 300,
    requiredSkills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'AWS'],
    salary: 3200,
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-08-31'),
    status: InternshipStatus.PUBLISHED,
    companyName: 'Rimac Technology d.o.o.',
  },
  {
    title: 'Frontend Developer Intern',
    description:
      'Dizajn i implementacija modernih korisničkih sučelja koristeći React, Next.js i Tailwind CSS. Student će raditi na responsive dizajnu, optimizaciji performansi i pristupačnosti web aplikacija. Suradnja s dizajnerima i backend developerima.',
    location: 'Split, Hrvatska',
    duration: 4,
    requiredHours: 200,
    requiredSkills: ['React', 'Next.js', 'Tailwind CSS', 'HTML', 'CSS'],
    salary: 2500,
    startDate: new Date('2026-05-01'),
    endDate: new Date('2026-08-31'),
    status: InternshipStatus.PUBLISHED,
    companyName: 'Tech Firma d.o.o.',
  },
  {
    title: 'Software Testing & QA Intern',
    description:
      'Sudjelovanje u testiranju softvera, pisanju automatiziranih testova i osiguravanju kvalitete proizvoda. Student će naučiti različite testing metodologije, raditi s alatima kao što su Jest, Cypress i Selenium, te pridonijeti stabilnosti sustava.',
    location: 'Zagreb, Hrvatska',
    duration: 5,
    requiredHours: 250,
    requiredSkills: ['Testing', 'Jest', 'Cypress', 'JavaScript', 'Selenium'],
    salary: 2600,
    startDate: new Date('2026-04-15'),
    endDate: new Date('2026-09-15'),
    status: InternshipStatus.PUBLISHED,
    companyName: 'Rimac Technology d.o.o.',
  },
];

export async function seedInternships(dataSource = AppDataSource) {
  const internshipRepository = dataSource.getRepository(Internship);
  const companyRepository = dataSource.getRepository(Company);

  const results: Internship[] = [];

  for (const data of internshipsData) {
    // Find the company by name
    const company = await companyRepository.findOne({
      where: { name: data.companyName },
    });

    if (!company) {
      console.log(`- Company ${data.companyName} not found, skipping internship: ${data.title}`);
      continue;
    }

    // Check if internship already exists (by title and company)
    const existingInternship = await internshipRepository.findOne({
      where: {
        title: data.title,
        companyId: company.id,
      },
    });

    if (existingInternship) {
      console.log(`- Internship "${data.title}" already exists for ${data.companyName}`);
      continue;
    }

    // Create internship
    const internship = internshipRepository.create({
      companyId: company.id,
      title: data.title,
      description: data.description,
      location: data.location,
      duration: data.duration,
      requiredHours: data.requiredHours,
      requiredSkills: data.requiredSkills,
      salary: data.salary,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
    });

    await internshipRepository.save(internship);
    console.log(`✓ Internship created: ${data.title} at ${data.companyName}`);
    results.push(internship);
  }

  return results;
}

// Allow running standalone
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => seedInternships())
    .then(() => AppDataSource.destroy())
    .catch((error) => {
      console.error('Error seeding internships:', error);
      process.exit(1);
    });
}
