import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorefrontController } from './storefront.controller';
import { StorefrontService } from './storefront.service';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy';

@Module({
    imports: [
        CampaignsModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('app.jwtSecret') || 'super-secret-key-change-in-production',
                signOptions: { expiresIn: (config.get<string>('app.jwtExpiresIn') || '1d') as any },
            }),
        }),
    ],
    controllers: [StorefrontController],
    providers: [StorefrontService, CustomerJwtStrategy],
    exports: [StorefrontService],
})
export class StorefrontModule { }

