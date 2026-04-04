/** 与 `plan/product/dev/接口表-v0.md` · AuthSession / UserBrief 对齐 */

export interface UserBrief {
  id: string;
  openid: string;
  role: string;
  nickname?: string;
  avatarUrl?: string;
}

export interface AuthSessionData {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn?: number;
  user: UserBrief;
}
