/**
 * 文案真源：plan/product/dev/P1-2-文案包-v0.md v0.1
 * 修改请先同步产品文档，避免现场编字。
 */

export const COPY = {
  loading: {
    page: "加载中…",
    submit: "提交中…",
    refresh: "刷新中",
  },
  network: {
    offline: "网络异常，请稍后重试",
    serviceBusy: "服务繁忙，请稍后再试",
    tooFrequent: "操作太频繁，请稍后再试",
    parseFail: "响应解析失败",
  },
  auth: {
    needLogin: "请先登录",
    loginFailed: "登录失败，请重试",
    tokenExpired: "登录已过期，请重新登录",
    noPermissionFeature: "暂无权限使用该功能",
    orderForbidden: "无法操作该订单",
    logoutDone: "已退出登录",
  },
  s1: {
    wechatLogin: "微信登录",
  },
  s2: {
    goOrder: "去下单",
    chooseSku: "请选择服务",
    designateTitle: "指定陪玩",
    designateHint: "不指定则由陪玩抢单",
    remarkPlaceholder: "选填：游戏 ID、特殊需求等",
    settlementOffline: "金额线下与俱乐部结算，平台不代收",
    submitOrder: "提交订单",
    orderSubmitted: "订单已提交",
  },
  s3: {
    emptyList: "暂无订单，去下一单吧",
  },
  s4: {
    helpContactClub: "如有问题请联系俱乐部管理人员",
    missingOrderId: "缺少订单信息",
    /** P1-2 §4.4 点名单状态补充；短标签仍以 P1-3 §2 为准 */
    designatedPendingLine: "已指定陪玩，等待对方接单",
  },
  s5: {
    enterCompanion: "陪玩接单",
    backPlayer: "返回玩家",
  },
  e1: {
    tabAvailable: "待接单",
    empty: "暂无可接订单",
  },
  e2: {
    emptyOngoing: "暂无进行中订单",
  },
  dev: {
    companionPlayerHint:
      "当前为玩家账号，陪玩数据需「陪玩」角色。测试可在库中修改 user.role 后重新登录。",
    /** 开发联调用；上线前由构建注入 */
    envNotConfigured: "请先配置后端地址（VITE_APP_API_BASE_URL）",
  },
  common: {
    unknownBusiness: "服务异常，请稍后重试",
  },
} as const;

/** 与 P1-2 §5、§3 对齐；未知 code 返回 undefined，由服务端 message 兜底 */
export function mapBusinessCodeToMessage(code: number): string | undefined {
  switch (code) {
    case 40001:
      return "请检查填写内容";
    case 40101:
      return COPY.auth.tokenExpired;
    case 40301:
      return COPY.auth.noPermissionFeature;
    case 40302:
      return COPY.auth.orderForbidden;
    case 40401:
      return "订单不存在或已失效";
    case 40901:
      return "手慢了，订单已被接";
    case 40902:
      return "订单已由管理员指派";
    case 40903:
      return "订单状态不允许该操作";
    case 40904:
      return "该单已指定陪玩，无法改派";
    case 42901:
      return COPY.network.tooFrequent;
    case 50000:
      return COPY.network.serviceBusy;
    default:
      return undefined;
  }
}
