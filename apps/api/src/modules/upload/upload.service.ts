import { Injectable, Logger, InternalServerErrorException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand, GetBucketPolicyCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { PrismaService } from '../../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService implements OnModuleInit {
    private readonly logger = new Logger(UploadService.name);
    private readonly s3Client: S3Client;
    private readonly bucketName: string;
    private readonly baseUrl: string;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        this.bucketName = this.configService.get<string>('S3_BUCKET', 'peyker-media');
        this.baseUrl = this.configService.get<string>('UPLOAD_BASE_URL', 'http://localhost:9000/peyker-media');

        const useSSL = this.configService.get<string>('S3_USE_SSL') === 'true';

        this.s3Client = new S3Client({
            region: this.configService.get<string>('S3_REGION', 'us-east-1'),
            endpoint: this.configService.get<string>('S3_ENDPOINT', 'http://localhost:9000'),
            forcePathStyle: true, // MinIO için gerekli
            credentials: {
                accessKeyId: this.configService.get<string>('S3_ACCESS_KEY', 'minioadmin'),
                secretAccessKey: this.configService.get<string>('S3_SECRET_KEY', 'minioadmin'),
            },
        });
    }

    /**
     * Uygulama başlarken Bucket var mı diye kontrol et, yoksa oluştur ve Public Read izni ver
     */
    async onModuleInit() {
        try {
            // Bucket varlığını kontrol et
            try {
                await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
                this.logger.log(`S3 Bucket '${this.bucketName}' mevcut.`);
            } catch (error: any) {
                if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                    this.logger.log(`S3 Bucket '${this.bucketName}' bulunamadı. Oluşturuluyor...`);
                    await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
                    this.logger.log(`S3 Bucket '${this.bucketName}' başarıyla oluşturuldu.`);
                } else {
                    throw error;
                }
            }

            // Public Read Policy kontrolü
            try {
                await this.s3Client.send(new GetBucketPolicyCommand({ Bucket: this.bucketName }));
            } catch (error: any) {
                if (error.name === 'NoSuchBucketPolicy' || error.$metadata?.httpStatusCode === 404) {
                    this.logger.log(`S3 Bucket '${this.bucketName}' için Public Read policy ayarlanıyor...`);
                    
                    const policy = JSON.stringify({
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Effect: 'Allow',
                                Principal: '*',
                                Action: ['s3:GetObject'],
                                Resource: [`arn:aws:s3:::${this.bucketName}/*`]
                            }
                        ]
                    });

                    await this.s3Client.send(new PutBucketPolicyCommand({ 
                        Bucket: this.bucketName, 
                        Policy: policy 
                    }));
                    this.logger.log(`S3 Bucket '${this.bucketName}' için Public Read policy başarıyla uygulandı.`);
                } else {
                    this.logger.warn(`Bucket policy kontrolü sırasında hata: ${error.message}`);
                }
            }
        } catch (error: any) {
            this.logger.error(`MinIO/S3 başlatma hatası: ${error.message}`, error.stack);
        }
    }

    /**
     * S3 (MinIO) sunucusuna dosya yükler ve DB'ye Media kaydı açar
     */
    async uploadFile(file: Express.Multer.File, folder: string = 'general') {
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const uniqueFilename = `${timestamp}-${randomStr}${ext}`;
        
        // Klasör içi yol: "products/123123-abc.jpg"
        const key = `${folder}/${uniqueFilename}`;

        try {
            const fileStream = fs.createReadStream(file.path);

            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                    Body: fileStream,
                    ContentType: file.mimetype,
                    // Eğer MinIO ACL desteklemiyorsa bu satırı silebilirsiniz, default public bucket yapısı
                    // ACL: 'public-read', 
                })
            );

            // Geçici dosyayı diskten sil (OOM ve disk şişmesini engelle)
            fs.unlink(file.path, (err) => {
                if (err) this.logger.error(`Geçici dosya silinemedi: ${file.path}`);
            });

            const fileUrl = `${this.baseUrl}/${key}`;

            // Veritabanına kaydet
            const mediaRecord = await this.prisma.media.create({
                data: {
                    filename: file.originalname,
                    key: key,
                    url: fileUrl,
                    mimetype: file.mimetype,
                    size: file.size,
                    folder: folder,
                }
            });

            this.logger.log(`File uploaded to S3: ${key}`);
            return mediaRecord;

        } catch (error) {
            this.logger.error(`S3 Upload Error: ${error.message}`);
            throw new InternalServerErrorException('Dosya yüklenirken bir hata oluştu: ' + error.message);
        }
    }

    /**
     * Çoklu dosya yükleme
     */
    async uploadMultiple(files: Express.Multer.File[], folder: string = 'general') {
        const uploadPromises = files.map(file => this.uploadFile(file, folder));
        return Promise.all(uploadPromises);
    }

    /**
     * Dosyayı hem S3'ten hem veritabanından siler
     */
    async deleteFile(id: string) {
        const media = await this.prisma.media.findUnique({
            where: { id }
        });

        if (!media) {
            throw new NotFoundException('Dosya bulunamadı');
        }

        try {
            // S3'ten sil
            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: this.bucketName,
                    Key: media.key,
                })
            );

            // Veritabanından sil
            await this.prisma.media.delete({
                where: { id: media.id }
            });

            this.logger.log(`File deleted from S3 and DB: ${media.key}`);
            return { success: true, message: 'Dosya silindi' };
        } catch (error) {
            this.logger.error(`S3 Delete Error: ${error.message}`);
            throw new InternalServerErrorException('Dosya silinirken bir hata oluştu');
        }
    }

    async deleteByKey(key: string) {
        const media = await this.prisma.media.findUnique({
            where: { key }
        });

        if (!media) {
            throw new NotFoundException('Dosya bulunamadı');
        }

        return this.deleteFile(media.id);
    }

    /**
     * Medya kütüphanesi için listeleme (API)
     */
    async findAll(query: { page?: number; limit?: number; folder?: string }) {
        const page = query.page || 1;
        const limit = query.limit || 50;
        const skip = (page - 1) * limit;

        const where = query.folder ? { folder: query.folder } : {};

        const [data, total] = await Promise.all([
            this.prisma.media.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.media.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
