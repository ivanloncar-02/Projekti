import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompaniesController, AdminCompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  controllers: [CompaniesController, AdminCompaniesController],
  providers: [CompaniesService],
  exports: [TypeOrmModule, CompaniesService],
})
export class CompaniesModule {}
