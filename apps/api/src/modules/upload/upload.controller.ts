import {
    Controller,
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

const multerOptions = {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
};

@ApiTags('Upload')
@Controller('upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @Post('single')
    @UseInterceptors(FileInterceptor('file', multerOptions))
    @ApiOperation({ summary: 'Upload a single file' })
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
    @ApiResponse({ status: 201, description: 'File uploaded successfully' })
    async uploadSingle(
        @UploadedFile() file: Express.Multer.File,
        @Query('folder') folder: string = 'products',
    ) {
        return this.uploadService.uploadFile(file, folder);
    }

    @Post('multiple')
    @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
    @ApiOperation({ summary: 'Upload multiple files (max 10)' })
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
    @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
    async uploadMultiple(
        @UploadedFiles() files: Express.Multer.File[],
        @Query('folder') folder: string = 'products',
    ) {
        return this.uploadService.uploadMultiple(files, folder);
    }

    @Delete(':folder/:filename')
    @ApiOperation({ summary: 'Delete a file' })
    @ApiResponse({ status: 200, description: 'File deleted successfully' })
    async deleteFile(
        @Param('folder') folder: string,
        @Param('filename') filename: string,
    ) {
        const deleted = await this.uploadService.deleteFile(filename, folder);
        return { success: deleted, message: deleted ? 'Dosya silindi' : 'Dosya bulunamadı' };
    }
}
