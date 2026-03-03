import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadResult {
    filename: string;
    originalName: string;
    path: string;
    url: string;
    size: number;
    mimetype: string;
}

@Injectable()
export class UploadService {
    private readonly logger = new Logger(UploadService.name);
    private readonly uploadDir: string;
    private readonly baseUrl: string;

    constructor(private configService: ConfigService) {
        // Default to local storage, can be extended for S3/Cloudinary
        this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || './uploads';
        this.baseUrl = this.configService.get<string>('UPLOAD_BASE_URL') || 'http://localhost:5000/uploads';

        // Ensure upload directory exists
        this.ensureUploadDir();
    }

    private ensureUploadDir() {
        const dirs = ['products', 'categories', 'users', 'invoices'];
        dirs.forEach(dir => {
            const fullPath = path.join(this.uploadDir, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
                this.logger.log(`Created upload directory: ${fullPath}`);
            }
        });
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'products'): Promise<UploadResult> {
        if (!file) {
            throw new BadRequestException('Dosya bulunamadı');
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException('Geçersiz dosya tipi. Sadece JPEG, PNG, WebP ve GIF desteklenir.');
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new BadRequestException('Dosya boyutu 5MB\'dan büyük olamaz.');
        }

        // Generate unique filename
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const filename = `${timestamp}-${randomStr}${ext}`;

        // Save file
        const filePath = path.join(this.uploadDir, folder, filename);
        fs.writeFileSync(filePath, file.buffer);

        const result: UploadResult = {
            filename,
            originalName: file.originalname,
            path: filePath,
            url: `${this.baseUrl}/${folder}/${filename}`,
            size: file.size,
            mimetype: file.mimetype,
        };

        this.logger.log(`File uploaded: ${result.url}`);
        return result;
    }

    async uploadMultiple(files: Express.Multer.File[], folder: string = 'products'): Promise<UploadResult[]> {
        const results: UploadResult[] = [];
        for (const file of files) {
            const result = await this.uploadFile(file, folder);
            results.push(result);
        }
        return results;
    }

    async deleteFile(filename: string, folder: string = 'products'): Promise<boolean> {
        try {
            const filePath = path.join(this.uploadDir, folder, filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                this.logger.log(`File deleted: ${filename}`);
                return true;
            }
            return false;
        } catch (error) {
            this.logger.error(`Failed to delete file: ${error.message}`);
            return false;
        }
    }
}
