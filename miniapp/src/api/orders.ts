import { request } from "@/utils/request";
import type { CreateOrderBody, OrderDetail, OrderListItem, PageResult } from "@/types/order";

export function getOrders(params: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
  if (params.status) q.set("status", params.status);
  const qs = q.toString();
  return request<PageResult<OrderListItem>>({
    path: `/api/v1/orders${qs ? `?${qs}` : ""}`,
    method: "GET",
  });
}

export function createOrder(body: CreateOrderBody) {
  return request<OrderDetail>({
    path: "/api/v1/orders",
    method: "POST",
    data: body,
  });
}

export function getOrderDetail(orderId: string) {
  return request<OrderDetail>({
    path: `/api/v1/orders/${encodeURIComponent(orderId)}`,
    method: "GET",
  });
}
