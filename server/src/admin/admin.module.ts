import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from '../order/orders.module';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminOrdersController } from './admin-orders.controller';

@Module({
  imports: [AuthModule, OrdersModule],
  controllers: [AdminAuthController, AdminOrdersController],
  providers: [AdminAuthService],
})
export class AdminModule {}
