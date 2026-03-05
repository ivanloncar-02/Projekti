import { InternshipsService } from './internships.service';
export declare class PublicInternshipsController {
    private readonly internshipsService;
    constructor(internshipsService: InternshipsService);
    findPublicInternships(page?: number, limit?: number): Promise<{
        items: any[];
        meta: any;
    }>;
    findOnePublic(id: string): Promise<import("./entities/internship.entity").Internship>;
}
