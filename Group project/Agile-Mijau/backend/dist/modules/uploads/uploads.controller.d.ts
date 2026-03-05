import type { Response } from 'express';
import { UploadsService } from './uploads.service';
export declare class UploadsController {
    private readonly uploadsService;
    constructor(uploadsService: UploadsService);
    uploadCV(file: Express.Multer.File, userId: string): Promise<{
        message: string;
        filename: string;
        path: string;
    }>;
    uploadDocuments(files: Express.Multer.File[], userId: string): Promise<{
        message: string;
        files: {
            filename: string;
            path: string;
        }[];
    }>;
    getCV(filename: string, res: Response): Promise<void>;
    getDocument(filename: string, res: Response): Promise<void>;
}
