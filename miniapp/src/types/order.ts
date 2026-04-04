/** 与 `plan/product/dev/接口表-v0.md` §4 及后端 `OrdersService.toListItem` 对齐 */

export interface OrderListItem {
  id: string;
  status: string;
  statusText: string;
  createdAt: string;
  designatedCompanionUserId: string | null;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OrderDetail extends OrderListItem {
  skuSnapshot: Record<string, unknown>;
  playerUserId: string;
  companionUserId: string | null;
  remark: string | null;
  gameRegion: string | null;
  durationMinutes: number | null;
  timeline: Array<{ status: string; at: string }>;
}

export interface CreateOrderBody {
  skuId: string;
  gameRegion?: string;
  durationMinutes?: number;
  remark?: string;
  designatedCompanionUserId?: string | null;
}
