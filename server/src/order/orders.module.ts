import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Order } from './order.entity';
import { CompanionOrdersController } from './companion-orders.controller';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User])],
  controllers: [OrdersController, CompanionOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
