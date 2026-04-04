/** 本地会话（勿存 AppSecret） */
export const STORAGE_ACCESS_TOKEN = "clubxcx_access_token";
export const STORAGE_USER = "clubxcx_user";

/** 仅清 storage，供 `auth-session` 与 `unauthorized` 共用，避免 request 循环依赖 */
export function clearStoredTokens() {
  uni.removeStorageSync(STORAGE_ACCESS_TOKEN);
  uni.removeStorageSync(STORAGE_USER);
}
