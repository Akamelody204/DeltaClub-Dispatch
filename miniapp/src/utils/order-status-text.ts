/**
 * 订单列表/详情短标签真源：plan/product/dev/P1-3-订单状态与用户可见文案映射表-v0.md §2
 * `PENDING_GRAB` 需结合 `designatedCompanionUserId` 是否为空（与接口表字段名一致）。
 */

export function formatOrderStatusText(
  status: string,
  designatedCompanionUserId: string | null | undefined,
  statusTextFallback?: string | null,
): string {
  const designated =
    designatedCompanionUserId != null &&
    String(designatedCompanionUserId).trim() !== "";

  switch (status) {
    case "PENDING_GRAB":
      return designated ? "待 TA 接单" : "待接单";
    case "ACCEPTED":
      return "已接单";
    case "IN_SERVICE":
      return "服务中";
    case "COMPLETED":
      return "已完成";
    case "CANCELLED":
      return "已取消";
    default: {
      const t = statusTextFallback?.trim();
      return t || "—";
    }
  }
}
