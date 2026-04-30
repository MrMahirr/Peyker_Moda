import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { appConfig } from './config';

// Faz 1: Auth
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';

// Faz 2: Catalog
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { VariantsModule } from './modules/variants/variants.module';

// Faz 3: CRM
import { CustomersModule } from './modules/customers/customers.module';
import { CustomerGroupsModule } from './modules/customer-groups/customer-groups.module';

// Faz 4: Sales & POS
import { OrdersModule } from './modules/orders/orders.module';
import { PosModule } from './modules/pos/pos.module';

// Faz 5: Muhasebe
import { TransactionsModule } from './modules/transactions/transactions.module';
import { AccountingModule } from './modules/accounting/accounting.module';

// Faz 6: Kampanyalar
import { CampaignsModule } from './modules/campaigns/campaigns.module';

// Faz 7: WebSocket
import { WebsocketModule } from './websocket/websocket.module';

// Faz 8: Dashboard
import { DashboardModule } from './modules/dashboard/dashboard.module';

// Faz 9: Storefront
import { StorefrontModule } from './modules/storefront/storefront.module';

// Faz 5.2: Invoices
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentModule } from './modules/payment/payment.module';
import { EmailModule } from './modules/email/email.module';
import { UploadModule } from './modules/upload/upload.module';
import { CargoModule } from './modules/cargo/cargo.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ShippingModule } from './modules/shipping/shipping.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),

    // Rate Limiting - Brute force protection
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'default',
          ttl: config.get('app.throttleTtl', 60000),
          limit: config.get('app.throttleLimit', 100),
        },
      ],
    }),

    // Database
    PrismaModule,

    // Cache
    RedisModule,

    // Faz 1: Auth & RBAC
    AuthModule,
    UsersModule,
    RolesModule,
    AuditLogsModule,

    // Faz 2: Catalog
    CategoriesModule,
    ProductsModule,
    VariantsModule,

    // Faz 3: CRM
    CustomersModule,
    CustomerGroupsModule,

    // Faz 4: Sales & POS
    OrdersModule,
    PosModule,

    // Faz 5: Muhasebe
    TransactionsModule,
    AccountingModule,
    InvoicesModule,

    // Faz 6: Kampanyalar
    CampaignsModule,

    // Faz 7: WebSocket
    WebsocketModule,

    // Faz 8: Dashboard
    DashboardModule,

    // Faz 9: Storefront (Public API)
    StorefrontModule,

    PaymentModule,

    // Email Notifications
    EmailModule,

    // File Upload
    UploadModule,

    // Cargo Integration
    CargoModule,

    // Shipping & Logistics
    ShippingModule,

    // Settings
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
