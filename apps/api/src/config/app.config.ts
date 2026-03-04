import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || 'api',

    // CORS
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

    // File uploads
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB

    // Rate Limiting
    throttleTtl: parseInt(process.env.THROTTLE_TTL || '60000', 10), // 60 seconds
    throttleLimit: parseInt(process.env.THROTTLE_LIMIT || '100', 10), // 100 requests

    // Redis
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
    redisPassword: process.env.REDIS_PASSWORD || '',
}));
