/**
 * 需登录后方可进入的路由（与 M0-4「首页 / 我的公开，业务下单与订单与陪玩大厅需会话」一致）。
 * 新增受保护页时在此登记，并同步 `plan/miniapp/dev/M1-2-无token拦截与路由守卫.md`。
 */
const AUTH_REQUIRED_PATHS = new Set([
  "/pages/order/create",
  "/pages/order/list",
  "/pages/order/detail",
  "/pages/companion/pending",
]);
export function normalizeRouteUrl(url: string): string {
  const path = url.split("?")[0].trim();
  if (!path.startsWith("/")) return `/${path}`;
  return path;
}

export function isAuthRequiredUrl(url: string): boolean {
  return AUTH_REQUIRED_PATHS.has(normalizeRouteUrl(url));
}
