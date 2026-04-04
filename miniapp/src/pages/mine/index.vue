<template>
  <view class="page">
    <view v-if="showEnvBanner" class="env-banner">
      <text class="env-line">环境：{{ appEnv }}</text>
      <text class="env-line">API：{{ apiBase || "（未配置）" }}</text>
    </view>
    <view class="card">
      <text class="label">登录状态</text>
      <text class="value">{{ sessionLabel }}</text>
    </view>
    <button v-if="!loggedIn" class="btn primary" @click="goLogin">
      {{ COPY.s1.wechatLogin }}
    </button>
    <template v-else>
      <button class="btn secondary" @click="goCompanion">
        {{ COPY.s5.enterCompanion }}
      </button>
      <button class="btn plain" @click="onLogout">退出登录</button>
    </template>
    <text class="hint">未登录可浏览首页/我的；下单、订单、待接单需登录（M1-2）。P1-4 定稿后可细调分流。</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { API_BASE_URL, APP_ENV, DEBUG_LOG } from "@/config/env";
import { COPY } from "@/constants/copy";
import { STORAGE_USER } from "@/constants/storage-keys";
import type { UserBrief } from "@/types/auth";
import { clearSession, hasSession, logoutRemote } from "@/services/auth-session";

const showEnvBanner = DEBUG_LOG;
const appEnv = APP_ENV;
const apiBase = API_BASE_URL;

const loggedIn = ref(false);
const sessionLabel = ref("未登录");

function refreshSession() {
  loggedIn.value = hasSession();
  if (!loggedIn.value) {
    sessionLabel.value = "未登录";
    return;
  }
  const raw = uni.getStorageSync(STORAGE_USER) as string | undefined;
  if (raw) {
    try {
      const u = JSON.parse(raw) as UserBrief;
      sessionLabel.value = `${u.nickname || u.role || "用户"} · ${u.role}`;
    } catch {
      sessionLabel.value = "已登录";
    }
  } else {
    sessionLabel.value = "已登录";
  }
}

onShow(() => {
  refreshSession();
});

function goLogin() {
  uni.navigateTo({ url: "/pages/auth/login" });
}

async function onLogout() {
  await logoutRemote();
  refreshSession();
  uni.showToast({ title: COPY.auth.logoutDone, icon: "none" });
}

function goCompanion() {
  uni.navigateTo({ url: "/pages/companion/pending" });
}
</script>

<style scoped>
.page {
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.env-banner {
  margin-bottom: 8rpx;
  padding: 20rpx 24rpx;
  background: #fff7e6;
  border-radius: 12rpx;
  border: 1rpx solid #ffe58f;
}
.env-line {
  display: block;
  font-size: 24rpx;
  color: #ad6800;
  line-height: 1.6;
  word-break: break-all;
}
.card {
  padding: 28rpx;
  background: #fff;
  border-radius: 16rpx;
  border: 1rpx solid #eee;
}
.label {
  display: block;
  font-size: 24rpx;
  color: #8f8f94;
  margin-bottom: 12rpx;
}
.value {
  font-size: 32rpx;
  color: #111;
}
.btn {
  margin-top: 8rpx;
}
.btn.primary {
  background: #076bff;
  color: #fff;
}
.btn.secondary {
  background: #e8f2ff;
  color: #076bff;
}
.btn.plain {
  background: #f5f5f5;
  color: #333;
}
.hint {
  font-size: 24rpx;
  color: #bbb;
  line-height: 1.5;
  margin-top: 16rpx;
}
</style>
