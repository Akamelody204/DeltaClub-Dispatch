/** 与 `docs/STATE_MACHINE.md` v0.1-draft 一致；冻结以产品 P2-1 为准 */
export const ORDER_STATUSES = [
  'PENDING_GRAB',
  'ACCEPTED',
  'IN_SERVICE',
  'COMPLETED',
  'CANCELLED',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** 非 `PENDING_GRAB` 的固定短文案（与 `plan/product/dev/P1-3-订单状态与用户可见文案映射表-v0.md` §2 一致） */
const ORDER_STATUS_TEXT_EXCEPT_PENDING: Record<
  Exclude<OrderStatus, 'PENDING_GRAB'>,
  string
> = {
  ACCEPTED: '已接单',
  IN_SERVICE: '服务中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
};

/**
 * 用户可见 `statusText`（与 **P1-3 §2**、接口表建议返回值一致）。
 * `PENDING_GRAB` 须结合是否点名（`designatedCompanionUserId` 非空）区分文案。
 */
export function getOrderStatusDisplayText(
  status: OrderStatus,
  designatedCompanionUserId: string | null | undefined,
): string {
  if (status === 'PENDING_GRAB') {
    const designated =
      designatedCompanionUserId != null &&
      String(designatedCompanionUserId).trim() !== '';
    return designated ? '待 TA 接单' : '待接单';
  }
  return ORDER_STATUS_TEXT_EXCEPT_PENDING[status] ?? status;
}
