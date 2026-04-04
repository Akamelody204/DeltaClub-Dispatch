/** JWT 载荷（与登录签发一致） */
export interface JwtPayload {
  sub: string;
  role: string;
  openid: string;
}
