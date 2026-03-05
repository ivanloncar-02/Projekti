"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seed_1 = require("./seed");
const data_source_1 = require("../data-source");
async function bootstrap() {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('✅ Database connection established');
        await (0, seed_1.runSeed)(data_source_1.AppDataSource);
        await data_source_1.AppDataSource.destroy();
        console.log('✅ Database connection closed');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Seed process failed:', error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=run-seed.js.map