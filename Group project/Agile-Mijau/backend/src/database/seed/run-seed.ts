import { runSeed } from './seed';
import { AppDataSource } from '../data-source'; // 1. Change this import

async function bootstrap() {
  try {
    // 2. Use AppDataSource directly instead of 'new DataSource(options)'
    await AppDataSource.initialize(); 
    console.log('✅ Database connection established');

    await runSeed(AppDataSource);

    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed process failed:', error);
    process.exit(1);
  }
}

bootstrap();