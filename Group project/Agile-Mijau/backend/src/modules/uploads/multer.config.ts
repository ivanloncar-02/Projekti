import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export const multerConfig = {
  cv: {
    storage: diskStorage({
      destination: './uploads/cv',
      filename: (req, file, callback) => {
        const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
        callback(null, uniqueName);
      },
    }),
    fileFilter: (req, file, callback) => {
      const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new BadRequestException('Dozvoljeni formati: PDF, DOC, DOCX'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  },
  documents: {
    storage: diskStorage({
      destination: './uploads/documents',
      filename: (req, file, callback) => {
        const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
        callback(null, uniqueName);
      },
    }),
    fileFilter: (req, file, callback) => {
      const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
      ];
      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new BadRequestException('Dozvoljeni formati: PDF, DOC, DOCX, JPG, PNG'), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  },
};
