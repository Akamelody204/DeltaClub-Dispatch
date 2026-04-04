<template>
  <view class="page">
    <text class="hint">使用微信授权登录俱乐部账号（与后端 `POST /api/v1/auth/wechat/login` 联调）</text>
    <button class="btn primary" :loading="loading" @click="onLogin">
      {{ COPY.s1.wechatLogin }}
    </button>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { COPY } from "@/constants/copy";
import { loginWithWechatButton } from "@/services/auth-session";
import { userMessageFromError } from "@/utils/api-error";

const loading = ref(false);

async function onLogin() {
  loading.value = true;
  try {
    await loginWithWechatButton();
    uni.navigateBack({
      fail: () => uni.switchTab({ url: "/pages/mine/index" }),
    });
  } catch (e) {
    const msg = userMessageFromError(e);
    uni.showToast({
      title: msg === COPY.network.offline ? COPY.auth.loginFailed : msg,
      icon: "none",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page {
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}
.hint {
  font-size: 28rpx;
  color: #8f8f94;
  line-height: 1.5;
}
.btn {
  margin-top: 16rpx;
}
.btn.primary {
  background: #076bff;
  color: #fff;
}
</style>
