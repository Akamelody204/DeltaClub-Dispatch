<template>
  <view class="page">
    <view v-if="loading" class="muted loading-wrap">{{ COPY.loading.page }}</view>
    <view v-else-if="err" class="err">{{ err }}</view>
    <view v-else-if="items.length === 0" class="empty">
      <text class="muted">{{ COPY.s3.emptyList }}</text>
      <button class="empty-btn" @click="goCreate">{{ COPY.s2.goOrder }}</button>
    </view>
    <view v-else class="list">
      <view
        v-for="o in items"
        :key="o.id"
        class="item"
        @click="goDetail(o.id)"
      >
        <view class="row">
          <text class="status">{{
            formatOrderStatusText(
              o.status,
              o.designatedCompanionUserId,
              o.statusText,
            )
          }}</text>
          <text class="time">{{ formatTime(o.createdAt) }}</text>
        </view>
        <text class="id">单号 {{ shortId(o.id) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onPullDownRefresh } from "@dcloudio/uni-app";
import { COPY } from "@/constants/copy";
import { useAuthGuardOnShow } from "@/composables/useAuthGuardOnShow";
import { getOrders } from "@/api/orders";
import { userMessageFromError } from "@/utils/api-error";
import { formatOrderStatusText } from "@/utils/order-status-text";
import type { OrderListItem } from "@/types/order";

const loading = ref(true);
const err = ref("");
const items = ref<OrderListItem[]>([]);

async function loadOrders() {
  loading.value = true;
  err.value = "";
  try {
    const res = await getOrders({ page: 1, pageSize: 20 });
    items.value = res.items;
  } catch (e) {
    err.value = userMessageFromError(e);
  } finally {
    loading.value = false;
  }
}

useAuthGuardOnShow(() => loadOrders());

onPullDownRefresh(async () => {
  await loadOrders();
  uni.stopPullDownRefresh();
});

function shortId(id: string) {
  return id.length > 12 ? `${id.slice(0, 8)}…` : id;
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}

function goDetail(id: string) {
  uni.navigateTo({
    url: `/pages/order/detail?orderId=${encodeURIComponent(id)}`,
  });
}

function goCreate() {
  uni.switchTab({ url: "/pages/order/create" });
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 32rpx 48rpx;
  box-sizing: border-box;
}
.loading-wrap {
  padding: 48rpx 0;
  text-align: center;
}
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
  padding: 48rpx 0;
}
.muted {
  font-size: 28rpx;
  color: #8f8f94;
  text-align: center;
}
.empty-btn {
  font-size: 28rpx;
  background: #076bff;
  color: #fff;
}
.err {
  font-size: 28rpx;
  color: #cf1322;
  padding: 24rpx 0;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.item {
  padding: 28rpx;
  background: #fff;
  border-radius: 16rpx;
  border: 1rpx solid #eee;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}
.status {
  font-size: 30rpx;
  font-weight: 600;
  color: #111;
}
.time {
  font-size: 24rpx;
  color: #8f8f94;
}
.id {
  font-size: 24rpx;
  color: #666;
}
</style>
