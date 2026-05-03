import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { getWinstonConfig } from './logger.config';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('app.nodeEnv', 'development');
        const logLevel = configService.get<string>('app.logLevel', 'info');
        const logDir = configService.get<string>('app.logDir', './logs');
        return getWinstonConfig(nodeEnv, logLevel, logDir);
      },
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
