import { registerAs } from '@nestjs/config';

export default registerAs('app', () => {
    return {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '3000', 10),
        apiPrefix: process.env.API_PREFIX || 'api',

        // CORS
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

        // JWT
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
        jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

        // File uploads
        uploadPath: process.env.UPLOAD_PATH || './uploads',
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),

        // Rate Limiting
        throttleTtl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
        throttleLimit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
        throttleAuthTtl: parseInt(process.env.THROTTLE_AUTH_TTL || '60000', 10),
        throttleAuthLimit: parseInt(process.env.THROTTLE_AUTH_LIMIT || '5', 10),

        // Default admin user
        adminEmail: process.env.ADMIN_EMAIL || 'admin@peyker.com',
        adminPassword: process.env.ADMIN_PASSWORD,
        adminFirstName: process.env.ADMIN_FIRST_NAME || 'Admin',
        adminLastName: process.env.ADMIN_LAST_NAME || 'Peyker',
        adminForcePassword: process.env.ADMIN_FORCE_PASSWORD === 'true',

        // Redis
        redisHost: process.env.REDIS_HOST || 'localhost',
        redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
        redisPassword: process.env.REDIS_PASSWORD || '',

        // Logging
        logLevel: process.env.LOG_LEVEL || 'info',
        logDir: process.env.LOG_DIR || './logs',
    };
});
