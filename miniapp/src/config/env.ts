/**
 * 构建期注入的运行时配置（Vite import.meta.env）。
 * 勿在 VITE_* 中存放密钥——会进入小程序包体。
 */
export type AppEnv = "development" | "staging" | "production";

const rawEnv = (import.meta.env.VITE_APP_ENV || "development").toLowerCase();

export const APP_ENV: AppEnv =
  rawEnv === "staging" || rawEnv === "production" ? rawEnv : "development";

/** 后端 API 根 URL，无尾斜杠；M1-1 request 封装将以此为前缀 */
export const API_BASE_URL = (
  import.meta.env.VITE_APP_API_BASE_URL || ""
).replace(/\/+$/, "");

export const DEBUG_LOG =
  import.meta.env.VITE_APP_DEBUG_LOG === "true" || import.meta.env.DEV;
