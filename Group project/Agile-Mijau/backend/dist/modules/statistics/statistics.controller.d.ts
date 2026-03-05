import { StatisticsService } from './statistics.service';
import { StatisticsResponse } from './interfaces/statistics-response.interface';
export declare class StatisticsController {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
    getStatistics(year?: string, company?: string, startDate?: string, endDate?: string): Promise<StatisticsResponse>;
}
