export declare const multerConfig: {
    cv: {
        storage: import("multer").StorageEngine;
        fileFilter: (req: any, file: any, callback: any) => void;
        limits: {
            fileSize: number;
        };
    };
    documents: {
        storage: import("multer").StorageEngine;
        fileFilter: (req: any, file: any, callback: any) => void;
        limits: {
            fileSize: number;
        };
    };
};
