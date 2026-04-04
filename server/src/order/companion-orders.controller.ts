import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/jwt-payload';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { OrdersService } from './orders.service';

/** 接口表 §4.4；`ongoing` 为 E2「进行中」列表（与产品 P0-5 对齐）。 */
@Controller('companion/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('companion')
export class CompanionOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('available')
  async available(
    @Query() q: QueryOrdersDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.ordersService.listAvailableForCompanion(
      user.sub,
      q,
    );
    return { code: 0, message: 'ok', data };
  }

  @Get('ongoing')
  async ongoing(
    @Query() q: QueryOrdersDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.ordersService.listOngoingForCompanion(
      user.sub,
      q,
    );
    return { code: 0, message: 'ok', data };
  }
}
