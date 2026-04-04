import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ORDER_STATUSES, type OrderStatus } from '../../order/order-status';

/** 管理端订单列表（与接口表 §5.1 筛选占位） */
export class AdminQueryOrdersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;

  @IsOptional()
  @IsString()
  @IsIn([...ORDER_STATUSES])
  status?: OrderStatus;

  @IsOptional()
  @IsUUID('4')
  orderId?: string;
}
