import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Res,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { multerConfig } from './multer.config';
import { UploadsService } from './uploads.service';
import { existsSync } from 'fs';
import { join } from 'path';

@Controller('api/uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('cv')
  @Roles(UserRole.STUDENT)
  @UseInterceptors(FileInterceptor('file', multerConfig.cv))
  async uploadCV(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Datoteka nije priložena');
    }

    await this.uploadsService.updateStudentCV(userId, file.filename);

    return {
      message: 'CV uspješno učitan',
      filename: file.filename,
      path: `/api/uploads/cv/${file.filename}`,
    };
  }

  @Post('documents')
  @Roles(UserRole.STUDENT)
  @UseInterceptors(FilesInterceptor('files', 5, multerConfig.documents))
  async uploadDocuments(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser('id') userId: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Datoteke nisu priložene');
    }

    const filenames = files.map(f => f.filename);

    return {
      message: 'Dokumenti uspješno učitani',
      files: filenames.map(filename => ({
        filename,
        path: `/api/uploads/documents/${filename}`,
      })),
    };
  }

  @Get('cv/:filename')
  async getCV(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', 'cv', filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Datoteka nije pronađena');
    }

    return res.sendFile(filePath);
  }

  @Get('documents/:filename')
  async getDocument(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', 'documents', filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Datoteka nije pronađena');
    }

    return res.sendFile(filePath);
  }
}
