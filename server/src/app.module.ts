import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './order/orders.module';
import { AdminModule } from './admin/admin.module';
import { createTypeOrmModuleOptions } from './database/typeorm-app-options';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => createTypeOrmModuleOptions(config),
    }),
    HealthModule,
    AuthModule,
    OrdersModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
