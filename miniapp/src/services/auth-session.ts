import { postWechatLogin, postLogout } from "@/api/auth";
import {
  STORAGE_ACCESS_TOKEN,
  STORAGE_USER,
  clearStoredTokens,
} from "@/constants/storage-keys";
import type { AuthSessionData, UserBrief } from "@/types/auth";
import { debugLog } from "@/utils/debugLog";

export function persistSession(session: AuthSessionData) {
  uni.setStorageSync(STORAGE_ACCESS_TOKEN, session.accessToken);
  uni.setStorageSync(STORAGE_USER, JSON.stringify(session.user));
}

export function clearSession() {
  clearStoredTokens();
}

export function hasSession(): boolean {
  return !!uni.getStorageSync(STORAGE_ACCESS_TOKEN);
}

/** 本地缓存的用户信息（登录接口返回）；未登录返回 null */
export function getStoredUserBrief(): UserBrief | null {
  const raw = uni.getStorageSync(STORAGE_USER) as string | undefined;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserBrief;
  } catch {
    return null;
  }
}

/**
 * 静默登录：无本地 token 时 `uni.login` 换 code 调后端；已有 token 则跳过。
 * 失败不抛错，返回 false（便于 App 启动不阻断）。
 */
export async function trySilentWechatLogin(): Promise<boolean> {
  if (hasSession()) return true;
  return new Promise((resolve) => {
    uni.login({
      provider: "weixin",
      success: async (res) => {
        if (!res.code) {
          debugLog("auth", "silent: no code");
          resolve(false);
          return;
        }
        try {
          const session = await postWechatLogin(res.code);
          persistSession(session);
          resolve(true);
        } catch (e) {
          debugLog("auth", "silent login failed", e);
          resolve(false);
        }
      },
      fail: (err) => {
        debugLog("auth", "uni.login fail", err);
        resolve(false);
      },
    });
  });
}

/** 用户点击触发：强制重新 uni.login 并换 token */
export async function loginWithWechatButton(): Promise<AuthSessionData> {
  const code = await new Promise<string>((resolve, reject) => {
    uni.login({
      provider: "weixin",
      success: (res) => {
        if (res.code) resolve(res.code);
        else reject(new Error("未获取到 code"));
      },
      fail: reject,
    });
  });
  const session = await postWechatLogin(code);
  persistSession(session);
  return session;
}

export async function logoutRemote(): Promise<void> {
  try {
    await postLogout();
  } catch (e) {
    debugLog("auth", "logout api fail", e);
  } finally {
    clearSession();
  }
}
