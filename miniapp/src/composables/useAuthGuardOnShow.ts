import { onShow } from "@dcloudio/uni-app";
import { COPY } from "@/constants/copy";
import { hasSession } from "@/services/auth-session";

/**
 * 兜底：拦截器无法覆盖的场景（如分享进入、开发工具直开路径）在展示时补拦。
 * 已登录时可选执行 `onAuthorized`（如拉订单列表）。
 */
export function useAuthGuardOnShow(onAuthorized?: () => void | Promise<void>) {
  onShow(() => {
    if (!hasSession()) {
      uni.showToast({ title: COPY.auth.needLogin, icon: "none" });
      setTimeout(() => {
        uni.redirectTo({
          url: "/pages/auth/login",
          fail: () => {
            uni.navigateTo({ url: "/pages/auth/login" });
          },
        });
      }, 50);
      return;
    }
    void Promise.resolve(onAuthorized?.());
  });
}
