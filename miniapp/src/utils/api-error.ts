import { COPY } from "@/constants/copy";

/** 页面 catch：优先使用 request 已映射的 Error.message */
export function userMessageFromError(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  return COPY.network.offline;
}
