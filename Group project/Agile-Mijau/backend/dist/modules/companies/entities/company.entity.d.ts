import { Internship } from '../../internships/entities/internship.entity';
export declare enum CompanyStatus {
    ACTIVE = "ACTIVE",
    ARCHIVED = "ARCHIVED"
}
export declare class Company {
    id: string;
    name: string;
    oib: string;
    email: string;
    address: string;
    website: string | null;
    phone: string | null;
    contactPerson: string | null;
    status: CompanyStatus;
    createdAt: Date;
    updatedAt: Date;
    internships: Internship[];
}
