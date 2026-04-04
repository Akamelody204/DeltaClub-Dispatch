import { COPY, mapBusinessCodeToMessage } from "@/constants/copy";
import { API_BASE_URL } from "@/config/env";
import { STORAGE_ACCESS_TOKEN } from "@/constants/storage-keys";
import { debugLog } from "@/utils/debugLog";
import type { ApiEnvelope } from "@/types/api";
import { handleUnauthorized } from "@/utils/unauthorized";

function envelopeFailMessage(body: {
  code?: number;
  message?: string;
}): string {
  const c = body.code;
  if (typeof c === "number") {
    return (
      mapBusinessCodeToMessage(c) ??
      ((typeof body.message === "string" ? body.message : "") ||
        COPY.common.unknownBusiness)
    );
  }
  return typeof body.message === "string" ? body.message : COPY.network.offline;
}

export interface RequestOptions {
  /** 以 `/` 开头，含 `/api/v1` 前缀，如 `/api/v1/me` */
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: unknown;
  /** 默认 true；登录等接口传 false，不附加 Bearer */
  auth?: boolean;
}

function normalizePath(path: string): string {
  if (!path.startsWith("/")) return `/${path}`;
  return path;
}

/**
 * 统一请求：解析 Envelope，成功返回 `data`；失败 throw Error(message)。
 * **401**：`handleUnauthorized`（清会话 + reLaunch 登录）；路由拦截见 M1-2。
 */
export function request<T>(opts: RequestOptions): Promise<T> {
  const { path, method = "GET", data, auth = true } = opts;
  if (!API_BASE_URL) {
    return Promise.reject(new Error(COPY.dev.envNotConfigured));
  }
  const url = `${API_BASE_URL}${normalizePath(path)}`;
  const header: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (auth) {
    const token = uni.getStorageSync(STORAGE_ACCESS_TOKEN) as string | undefined;
    if (token) header.Authorization = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method,
      data: data as UniApp.RequestOptions["data"],
      header,
      success: (res) => {
        const status = res.statusCode ?? 0;
        let body: ApiEnvelope<T>;
        try {
          const raw = res.data;
          body =
            typeof raw === "string"
              ? (JSON.parse(raw) as ApiEnvelope<T>)
              : (raw as ApiEnvelope<T>);
        } catch {
          reject(new Error(COPY.network.parseFail));
          return;
        }
        if (status === 401 && opts.auth !== false) {
          handleUnauthorized(COPY.auth.tokenExpired);
          reject(new Error(COPY.auth.tokenExpired));
          return;
        }
        if (status < 200 || status >= 300) {
          const msg =
            typeof body.code === "number"
              ? envelopeFailMessage(body)
              : status >= 500
                ? COPY.network.serviceBusy
                : COPY.network.offline;
          reject(new Error(msg));
          return;
        }
        if (body.code !== 0) {
          const msg = envelopeFailMessage(body);
          if (opts.auth !== false && body.code === 40101) {
            handleUnauthorized(COPY.auth.tokenExpired);
            reject(new Error(msg));
            return;
          }
          reject(new Error(msg));
          return;
        }
        resolve(body.data as T);
      },
      fail: (err) => {
        debugLog("request", "fail", err);
        reject(new Error(err.errMsg || COPY.network.offline));
      },
    });
  });
}
