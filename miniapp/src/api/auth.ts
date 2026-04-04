import { request } from "@/utils/request";
import type { AuthSessionData, UserBrief } from "@/types/auth";

/** POST /api/v1/auth/wechat/login */
export function postWechatLogin(code: string) {
  return request<AuthSessionData>({
    path: "/api/v1/auth/wechat/login",
    method: "POST",
    data: { code },
    auth: false,
  });
}

/** POST /api/v1/auth/logout */
export function postLogout() {
  return request<null>({
    path: "/api/v1/auth/logout",
    method: "POST",
    data: {},
  });
}

/** GET /api/v1/me */
export function getMe() {
  return request<UserBrief>({
    path: "/api/v1/me",
    method: "GET",
  });
}
