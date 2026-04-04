import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/user.entity';
import { Order } from './order/order.entity';
import { OrdersModule } from './order/orders.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: parseInt(String(config.get('DB_PORT', '3306')), 10),
        username: config.get<string>('DB_USER', 'root'),
        password: config.get<string>('DB_PASSWORD', 'root'),
        database: config.get<string>('DB_NAME', 'clubxcx'),
        entities: [User, Order],
        synchronize: config.get<string>('DB_SYNC', 'true') === 'true',
        logging: config.get<string>('DB_LOG') === 'true',
      }),
    }),
    HealthModule,
    AuthModule,
    OrdersModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
