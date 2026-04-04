import { DEBUG_LOG } from "@/config/env";

/** 仅当 VITE_APP_DEBUG_LOG=true 或 Vite 开发模式时输出 */
export function debugLog(tag: string, ...args: unknown[]) {
  if (!DEBUG_LOG) return;
  console.log(`[clubxcx][${tag}]`, ...args);
}
