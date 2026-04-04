<template>
  <view class="page">
    <text class="tip">{{ COPY.s2.settlementOffline }}</text>
    <view class="field optional">
      <text class="label">{{ COPY.s2.designateTitle }}</text>
      <text class="sub">{{ COPY.s2.designateHint }}</text>
    </view>
    <view class="field">
      <text class="label">SKU ID</text>
      <input
        v-model="skuId"
        class="input"
        placeholder="如 sku-demo-1"
      />
    </view>
    <view class="field">
      <text class="label">区服（可选）</text>
      <input v-model="gameRegion" class="input" placeholder="区服" />
    </view>
    <view class="field">
      <text class="label">备注（可选）</text>
      <textarea
        v-model="remark"
        class="textarea"
        :placeholder="COPY.s2.remarkPlaceholder"
        maxlength="500"
      />
    </view>
    <button
      class="submit"
      :loading="submitting"
      :disabled="!skuId.trim()"
      @click="submit"
    >
      {{ submitting ? COPY.loading.submit : COPY.s2.submitOrder }}
    </button>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { COPY } from "@/constants/copy";
import { useAuthGuardOnShow } from "@/composables/useAuthGuardOnShow";
import { createOrder } from "@/api/orders";
import { userMessageFromError } from "@/utils/api-error";

const skuId = ref("sku-demo-1");
const gameRegion = ref("");
const remark = ref("");
const submitting = ref(false);

useAuthGuardOnShow();

async function submit() {
  const id = skuId.value.trim();
  if (!id) {
    uni.showToast({ title: COPY.s2.chooseSku, icon: "none" });
    return;
  }
  submitting.value = true;
  try {
    await createOrder({
      skuId: id,
      gameRegion: gameRegion.value.trim() || undefined,
      remark: remark.value.trim() || undefined,
    });
    uni.showToast({ title: COPY.s2.orderSubmitted, icon: "success" });
    setTimeout(() => {
      uni.switchTab({ url: "/pages/order/list" });
    }, 400);
  } catch (e) {
    uni.showToast({ title: userMessageFromError(e), icon: "none" });
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.page {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}
.tip {
  font-size: 26rpx;
  color: #8f8f94;
  line-height: 1.5;
}
.optional .sub {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.label {
  font-size: 26rpx;
  color: #666;
}
.input {
  padding: 20rpx 24rpx;
  background: #fff;
  border: 1rpx solid #e5e5e5;
  border-radius: 12rpx;
  font-size: 28rpx;
}
.textarea {
  min-height: 160rpx;
  padding: 20rpx 24rpx;
  background: #fff;
  border: 1rpx solid #e5e5e5;
  border-radius: 12rpx;
  font-size: 28rpx;
  width: 100%;
  box-sizing: border-box;
}
.submit {
  margin-top: 24rpx;
  background: #076bff;
  color: #fff;
  font-size: 30rpx;
}
</style>
