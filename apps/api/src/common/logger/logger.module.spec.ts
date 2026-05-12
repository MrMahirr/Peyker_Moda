import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from './logger.module';
import { ConfigModule } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('LoggerModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({ app: { nodeEnv: 'development', logLevel: 'info', logDir: './logs' } })],
        }),
        LoggerModule,
      ],
    }).compile();
  });

  it('should provide Winston logger', () => {
    const logger = module.get(WINSTON_MODULE_NEST_PROVIDER);
    expect(logger).toBeDefined();
    expect(typeof logger.log).toBe('function');
  });
});
