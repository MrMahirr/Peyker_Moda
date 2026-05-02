import { registerAs } from '@nestjs/config';

export default registerAs('app', () => {
    const jwtSecret = process.env.JWT_SECRET;
    
    // Güvenlik: Production'da zayıf veya varsayılan secret kullanımını engelle
    if (!jwtSecret || jwtSecret === 'super-secret-key-change-in-production') {
        throw new Error('FATAL: JWT_SECRET environment variable is missing or insecure. Please set a strong random secret in your .env file.');
    }

    return {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '3000', 10),
        apiPrefix: process.env.API_PREFIX || 'api',

        // CORS
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

        // JWT
        jwtSecret,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
        jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

        // File uploads
        uploadPath: process.env.UPLOAD_PATH || './uploads',
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB

        // Rate Limiting
        throttleTtl: parseInt(process.env.THROTTLE_TTL || '60000', 10), // 60 seconds
        throttleLimit: parseInt(process.env.THROTTLE_LIMIT || '100', 10), // 100 requests

        // Default admin user
        adminEmail: process.env.ADMIN_EMAIL || 'admin@peyker.com',
        adminPassword: process.env.ADMIN_PASSWORD || 'Admin123!',
        adminFirstName: process.env.ADMIN_FIRST_NAME || 'Admin',
        adminLastName: process.env.ADMIN_LAST_NAME || 'Peyker',
        adminForcePassword: process.env.ADMIN_FORCE_PASSWORD || 'false',

        // Redis
        redisHost: process.env.REDIS_HOST || 'localhost',
        redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
        redisPassword: process.env.REDIS_PASSWORD || '',
    };
});
