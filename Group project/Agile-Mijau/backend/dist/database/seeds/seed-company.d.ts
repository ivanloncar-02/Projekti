import { User } from '../../modules/users/entities/user.entity';
import { Company } from '../../modules/companies/entities/company.entity';
export declare function seedCompany(dataSource?: import("typeorm").DataSource): Promise<{
    company: Company;
    employer: User;
    mentor: User;
}[]>;
