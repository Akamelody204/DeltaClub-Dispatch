import { request } from "@/utils/request";
import type { OrderListItem, PageResult } from "@/types/order";

/** GET /api/v1/companion/orders/available（§4.4） */
export function getCompanionAvailableOrders(params?: {
  page?: number;
  pageSize?: number;
}) {
  const q = new URLSearchParams();
  if (params?.page != null) q.set("page", String(params.page));
  if (params?.pageSize != null) q.set("pageSize", String(params.pageSize));
  const qs = q.toString();
  return request<PageResult<OrderListItem>>({
    path: `/api/v1/companion/orders/available${qs ? `?${qs}` : ""}`,
    method: "GET",
  });
}

/** GET /api/v1/companion/orders/ongoing（进行中，对齐 P0-5 E2） */
export function getCompanionOngoingOrders(params?: {
  page?: number;
  pageSize?: number;
}) {
  const q = new URLSearchParams();
  if (params?.page != null) q.set("page", String(params.page));
  if (params?.pageSize != null) q.set("pageSize", String(params.pageSize));
  const qs = q.toString();
  return request<PageResult<OrderListItem>>({
    path: `/api/v1/companion/orders/ongoing${qs ? `?${qs}` : ""}`,
    method: "GET",
  });
}
