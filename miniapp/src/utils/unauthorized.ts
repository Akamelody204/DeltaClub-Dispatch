import { COPY } from "@/constants/copy";
import { clearStoredTokens } from "@/constants/storage-keys";

let handling = false;

/**
 * token 失效 / 401：清会话并回登录（reLaunch 避免返回栈仍带过期态）。
 * 与 `request.ts`、M1-3 统一处理一致。
 */
export function handleUnauthorized(message?: string) {
  if (handling) return;
  const pages = getCurrentPages();
  const last = pages[pages.length - 1];
  const route = last?.route ?? "";
  if (route.includes("pages/auth/login")) return;

  handling = true;
  clearStoredTokens();
  uni.showToast({
    title: message || COPY.auth.tokenExpired,
    icon: "none",
    duration: 2000,
  });
  setTimeout(() => {
    uni.reLaunch({
      url: "/pages/auth/login",
      complete: () => {
        setTimeout(() => {
          handling = false;
        }, 400);
      },
    });
  }, 80);
}
