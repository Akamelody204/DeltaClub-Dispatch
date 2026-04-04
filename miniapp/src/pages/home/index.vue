<template>
  <view class="page">
    <text class="title">三角洲俱乐部</text>
    <text v-if="welcome" class="welcome">{{ welcome }}</text>
    <text class="hint">玩家首页 · 下单与订单在底部 Tab；需登录后使用。</text>
    <button class="cta primary" @click="goOrder">{{ COPY.s2.goOrder }}</button>
    <button class="cta secondary" @click="goCompanion">
      {{ COPY.s5.enterCompanion }}
    </button>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { getMe } from "@/api/auth";
import { COPY } from "@/constants/copy";
import { hasSession } from "@/services/auth-session";

const welcome = ref("");

onShow(async () => {
  if (!hasSession()) {
    welcome.value = "";
    return;
  }
  try {
    const me = await getMe();
    welcome.value = `你好，${me.nickname || me.role || "用户"}`;
  } catch {
    welcome.value = "";
  }
});

function goOrder() {
  uni.switchTab({ url: "/pages/order/create" });
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
.title {
  font-size: 40rpx;
  font-weight: 600;
  color: #111;
}
.welcome {
  font-size: 30rpx;
  color: #076bff;
}
.hint {
  font-size: 28rpx;
  color: #8f8f94;
  line-height: 1.5;
}
.cta {
  margin-top: 16rpx;
  font-size: 30rpx;
}
.cta.primary {
  background: #076bff;
  color: #fff;
}
.cta.secondary {
  background: #f5f5f5;
  color: #333;
}
</style>
