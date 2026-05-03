import { z } from 'zod';
import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidation');

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_PREFIX: z.string().default('api'),
  
  // Security
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Database (Prisma uses DATABASE_URL directly, but we can validate it here too)
  DATABASE_URL: z.string().url(),
  
  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  
  // Admin
  ADMIN_EMAIL: z.string().email().default('admin@peyker.com'),
  ADMIN_PASSWORD: z.string().min(8).default('Admin123!'),
  ADMIN_FIRST_NAME: z.string().default('Admin'),
  ADMIN_LAST_NAME: z.string().default('Peyker'),
  ADMIN_FORCE_PASSWORD: z.coerce.boolean().default(false),
  
  // Rate Limiting
  THROTTLE_TTL: z.coerce.number().default(60000),
  THROTTLE_LIMIT: z.coerce.number().default(100),
  
  // Uploads
  UPLOAD_PATH: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.coerce.number().default(5242880),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  LOG_DIR: z.string().default('./logs'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

export type Env = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    logger.error('❌ Invalid environment variables:');
    result.error.issues.forEach((issue) => {
      logger.error(`   - ${issue.path.join('.')}: ${issue.message}`);
    });
    throw new Error('Invalid environment variables');
  }

  // Extra custom validation: Prevent default admin password in production
  if (result.data.NODE_ENV === 'production' && result.data.ADMIN_PASSWORD === 'Admin123!') {
    logger.error('❌ Security Error: Default admin password (Admin123!) is not allowed in production.');
    throw new Error('Insecure admin password in production');
  }

  // Extra custom validation: Prevent default JWT secret in production
  if (result.data.NODE_ENV === 'production' && result.data.JWT_SECRET === 'super-secret-key-change-in-production') {
    logger.error('❌ Security Error: Default JWT secret is not allowed in production.');
    throw new Error('Insecure JWT secret in production');
  }

  return result.data;
}
