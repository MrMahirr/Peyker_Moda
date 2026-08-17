import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import * as path from 'path';

export interface FileValidationOptions {
  maxSizeMB?: number;
  allowedMimeTypes?: string[];
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly defaultOptions: FileValidationOptions = {
    maxSizeMB: 5,
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
    ],
  };

  private readonly options: FileValidationOptions;

  constructor(options?: FileValidationOptions) {
    this.options = { ...this.defaultOptions, ...options };
  }

  transform(value: any) {
    if (!value) {
      throw new BadRequestException('Dosya bulunamadı');
    }

    const files = Array.isArray(value) ? value : [value];

    for (const file of files) {
      this.validateFile(file);
    }

    return value;
  }

  private validateFile(file: Express.Multer.File) {
    if (!file.mimetype) {
      throw new BadRequestException('Bozuk dosya formatı');
    }

    // 1. MIME Tipi Doğrulama
    if (!this.options.allowedMimeTypes!.includes(file.mimetype)) {
      throw new BadRequestException(
        `Geçersiz dosya tipi (${file.originalname}). İzin verilenler: ${this.options.allowedMimeTypes!.join(', ')}`,
      );
    }

    // 2. Ext (Uzantı) Doğrulama (Basic File Spoofing Protection)
    const ext = path.extname(file.originalname).toLowerCase();
    const validExtensions = {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
      'application/pdf': ['.pdf'],
    };

    const allowedExts = validExtensions[file.mimetype] || [];
    if (allowedExts.length > 0 && !allowedExts.includes(ext)) {
      throw new BadRequestException(
        `Dosya uzantısı, içeriği (MIME) ile uyuşmuyor: ${file.originalname}`,
      );
    }

    // 3. Boyut Doğrulama
    const maxBytes = this.options.maxSizeMB! * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException(
        `Dosya boyutu çok büyük (${file.originalname}). Maksimum sınır: ${this.options.maxSizeMB}MB`,
      );
    }
  }
}
