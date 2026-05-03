import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { RedisService } from '../../../redis/redis.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const status = this.redisService.getClient().status;
      if (status === 'ready' || status === 'connect') {
        return this.getStatus(key, true);
      }
      
      // Fallback check with ping
      await this.redisService.getClient().ping();
      return this.getStatus(key, true);
    } catch (e) {
      throw new HealthCheckError('Redis check failed', this.getStatus(key, false, { message: e.message }));
    }
  }
}
