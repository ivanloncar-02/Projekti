"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerConfig = void 0;
const multer_1 = require("multer");
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
exports.multerConfig = {
    cv: {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/cv',
            filename: (req, file, callback) => {
                const uniqueName = `${(0, uuid_1.v4)()}${(0, path_1.extname)(file.originalname)}`;
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
            }
            else {
                callback(new common_1.BadRequestException('Dozvoljeni formati: PDF, DOC, DOCX'), false);
            }
        },
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    },
    documents: {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/documents',
            filename: (req, file, callback) => {
                const uniqueName = `${(0, uuid_1.v4)()}${(0, path_1.extname)(file.originalname)}`;
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
            }
            else {
                callback(new common_1.BadRequestException('Dozvoljeni formati: PDF, DOC, DOCX, JPG, PNG'), false);
            }
        },
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    },
};
//# sourceMappingURL=multer.config.js.map