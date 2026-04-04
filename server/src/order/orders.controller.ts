import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/jwt-payload';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('player')
  async create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.ordersService.create(user.sub, dto);
    return { code: 0, message: 'ok', data };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('player')
  async list(@Query() q: QueryOrdersDto, @CurrentUser() user: JwtPayload) {
    const data = await this.ordersService.listForPlayer(user.sub, q);
    return { code: 0, message: 'ok', data };
  }

  @Get(':orderId')
  @UseGuards(JwtAuthGuard)
  async getOne(
    @Param('orderId') orderId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.ordersService.getDetail(orderId, user);
    return { code: 0, message: 'ok', data };
  }
}
