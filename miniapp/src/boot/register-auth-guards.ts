import { COPY } from "@/constants/copy";
import { isAuthRequiredUrl } from "@/constants/auth-routes";
import { hasSession } from "@/services/auth-session";
import { debugLog } from "@/utils/debugLog";

const NAV_APIS = ["navigateTo", "redirectTo", "reLaunch", "switchTab"] as const;

function goLogin() {
  uni.showToast({ title: COPY.auth.needLogin, icon: "none", duration: 2000 });
  setTimeout(() => {
    uni.navigateTo({ url: "/pages/auth/login" });
  }, 50);
}

/**
 * M1-2：无 token 时拦截进入受保护路由，并引导登录页。
 */
export function registerAuthRouteGuards() {
  for (const api of NAV_APIS) {
    uni.addInterceptor(api, {
      invoke(options: { url?: string }) {
        const url = options?.url;
        if (!url || !isAuthRequiredUrl(url)) return;
        if (hasSession()) return;
        debugLog("guard", `block ${api}`, url);
        goLogin();
        return false;
      },
    });
  }
}

registerAuthRouteGuards();
