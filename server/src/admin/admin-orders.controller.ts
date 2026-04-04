import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrdersService } from '../order/orders.service';
import { AdminQueryOrdersDto } from './dto/admin-query-orders.dto';

/** 管理端订单只读占位（指派/取消/强改状态等见 Phase 2 / B2） */
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  async list(@Query() q: AdminQueryOrdersDto) {
    const data = await this.orders.listForAdmin(q);
    return { code: 0, message: 'ok', data };
  }

  @Get(':orderId')
  async getOne(@Param('orderId') orderId: string) {
    const data = await this.orders.getDetailForAdmin(orderId);
    return { code: 0, message: 'ok', data };
  }
}
