<template>
  <view class="page">
    <view v-if="loading" class="muted">{{ COPY.loading.page }}</view>
    <view v-else-if="err" class="err">{{ err }}</view>
    <view v-else-if="detail" class="card">
      <text class="title">{{
        formatOrderStatusText(
          detail.status,
          detail.designatedCompanionUserId,
          detail.statusText,
        )
      }}</text>
      <text v-if="showDesignatedPendingLine" class="subline">{{
        COPY.s4.designatedPendingLine
      }}</text>
      <text class="line">单号 {{ detail.id }}</text>
      <text class="line">创建 {{ detail.createdAt }}</text>
      <text v-if="detail.remark" class="line">备注 {{ detail.remark }}</text>
      <text v-if="detail.gameRegion" class="line">区服 {{ detail.gameRegion }}</text>
      <text class="help">{{ COPY.s4.helpContactClub }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { COPY } from "@/constants/copy";
import { useAuthGuardOnShow } from "@/composables/useAuthGuardOnShow";
import { getOrderDetail } from "@/api/orders";
import { userMessageFromError } from "@/utils/api-error";
import { formatOrderStatusText } from "@/utils/order-status-text";
import type { OrderDetail as OrderDetailT } from "@/types/order";

const orderId = ref("");
const loading = ref(true);
const err = ref("");
const detail = ref<OrderDetailT | null>(null);

const showDesignatedPendingLine = computed(() => {
  const d = detail.value;
  if (!d) return false;
  if (d.status !== "PENDING_GRAB") return false;
  const id = d.designatedCompanionUserId;
  return id != null && String(id).trim() !== "";
});

async function load() {
  if (!orderId.value) {
    err.value = COPY.s4.missingOrderId;
    loading.value = false;
    return;
  }
  loading.value = true;
  err.value = "";
  try {
    detail.value = await getOrderDetail(orderId.value);
  } catch (e) {
    err.value = userMessageFromError(e);
    detail.value = null;
  } finally {
    loading.value = false;
  }
}

onLoad((q?: Record<string, string | undefined>) => {
  orderId.value = (q?.orderId as string) || "";
});

useAuthGuardOnShow(() => load());
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  box-sizing: border-box;
}
.muted,
.err {
  font-size: 28rpx;
  padding: 48rpx 0;
  text-align: center;
}
.err {
  color: #cf1322;
}
.card {
  padding: 32rpx;
  background: #fff;
  border-radius: 16rpx;
  border: 1rpx solid #eee;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #111;
}
.subline {
  font-size: 26rpx;
  color: #576b95;
  line-height: 1.4;
}
.line {
  font-size: 28rpx;
  color: #555;
  word-break: break-all;
}
.help {
  margin-top: 24rpx;
  font-size: 24rpx;
  color: #8f8f94;
  line-height: 1.5;
}
</style>
