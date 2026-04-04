/** 与后端统一 Envelope 对齐（`docs/API_CONTRACT.md`） */
export interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}
