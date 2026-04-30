import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FileValidationPipe } from '../../common/pipes/file-validation.pipe';

const multerOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
};

@ApiTags('Media & Upload')
@Controller('upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get()
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Medya listesi' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('folder') folder?: string,
  ) {
    return this.uploadService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      folder,
    });
  }

  @Post('single')
  @Roles('admin', 'manager', 'staff')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiOperation({ summary: 'Tekli dosya yukle' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', default: 'products' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully to S3 & DB' })
  async uploadSingle(
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
    @Query('folder') folder: string = 'products',
  ) {
    return this.uploadService.uploadFile(file, folder);
  }

  @Post('multiple')
  @Roles('admin', 'manager', 'staff')
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  @ApiOperation({ summary: 'Coklu dosya yukle (Maks 10)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
        folder: { type: 'string', default: 'products' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully to S3 & DB' })
  async uploadMultiple(
    @UploadedFiles(new FileValidationPipe()) files: Express.Multer.File[],
    @Query('folder') folder: string = 'products',
  ) {
    return this.uploadService.uploadMultiple(files, folder);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Dosya sil (id)' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Param('id') id: string) {
    return this.uploadService.deleteFile(id);
  }

  @Delete(':folder/:filename')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Dosya sil (folder/filename)' })
  async deleteByPath(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
  ) {
    const key = `${folder}/${filename}`;
    return this.uploadService.deleteByKey(key);
  }
}
