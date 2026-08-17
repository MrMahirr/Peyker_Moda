import { validate } from './env.validation';

describe('Environment Validation', () => {
  const validConfig = {
    NODE_ENV: 'development',
    PORT: '3000',
    JWT_SECRET: 'super-secret-key-change-in-production-long-enough',
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    ADMIN_EMAIL: 'admin@peyker.com',
    ADMIN_PASSWORD: 'securePassword123',
  };

  it('should validate a correct config', () => {
    const result = validate(validConfig);
    expect(result.PORT).toBe(3000);
    expect(result.NODE_ENV).toBe('development');
  });

  it('should throw error if JWT_SECRET is missing', () => {
    const { JWT_SECRET, ...invalidConfig } = validConfig;
    expect(() => validate(invalidConfig)).toThrow(
      'Invalid environment variables',
    );
  });

  it('should throw error if JWT_SECRET is too short', () => {
    const invalidConfig = { ...validConfig, JWT_SECRET: 'short' };
    expect(() => validate(invalidConfig)).toThrow(
      'Invalid environment variables',
    );
  });

  it('should throw error if ADMIN_PASSWORD is insecure in production', () => {
    const invalidConfig = {
      ...validConfig,
      NODE_ENV: 'production',
      ADMIN_PASSWORD: 'Admin123!',
    };
    expect(() => validate(invalidConfig)).toThrow(
      'Insecure admin password in production',
    );
  });

  it('should throw error if JWT_SECRET is default in production', () => {
    const invalidConfig = {
      ...validConfig,
      NODE_ENV: 'production',
      JWT_SECRET: 'super-secret-key-change-in-production',
    };
    expect(() => validate(invalidConfig)).toThrow(
      'Insecure JWT secret in production',
    );
  });
});
