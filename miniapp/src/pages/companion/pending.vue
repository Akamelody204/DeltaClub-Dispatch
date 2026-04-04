<template>
  <view class="page">
    <view v-if="roleBanner" class="banner">{{ roleBanner }}</view>
    <view class="tabs">
      <view
        class="tab"
        :class="{ active: tab === 'available' }"
        @click="switchTab('available')"
      >
        {{ COPY.e1.tabAvailable }}
      </view>
      <view
        class="tab"
        :class="{ active: tab === 'ongoing' }"
        @click="switchTab('ongoing')"
      >
        进行中
      </view>
    </view>
    <view v-if="loading" class="muted">{{ COPY.loading.page }}</view>
    <view v-else-if="err" class="err">{{ err }}</view>
    <view v-else-if="items.length === 0" class="muted">{{
      emptyText
    }}</view>
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
    <button class="back" @click="goBack">{{ COPY.s5.backPlayer }}</button>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { onPullDownRefresh } from "@dcloudio/uni-app";
import { useAuthGuardOnShow } from "@/composables/useAuthGuardOnShow";
import {
  getCompanionAvailableOrders,
  getCompanionOngoingOrders,
} from "@/api/companion";
import { COPY } from "@/constants/copy";
import type { OrderListItem } from "@/types/order";
import { userMessageFromError } from "@/utils/api-error";
import { formatOrderStatusText } from "@/utils/order-status-text";
import { getStoredUserBrief } from "@/services/auth-session";

const tab = ref<"available" | "ongoing">("available");
const loading = ref(true);
const err = ref("");
const items = ref<OrderListItem[]>([]);

const roleBanner = computed(() => {
  const u = getStoredUserBrief();
  if (!u) return "";
  if (u.role === "player") {
    return COPY.dev.companionPlayerHint;
  }
  if (u.role === "companion") {
    return "";
  }
  return "";
});

const emptyText = computed(() => {
  if (tab.value === "available") return COPY.e1.empty;
  return COPY.e2.emptyOngoing;
});

async function load() {
  const u = getStoredUserBrief();
  if (u?.role === "player") {
    items.value = [];
    err.value = "";
    loading.value = false;
    return;
  }
  loading.value = true;
  err.value = "";
  try {
    if (tab.value === "available") {
      const res = await getCompanionAvailableOrders({
        page: 1,
        pageSize: 20,
      });
      items.value = res.items;
    } else {
      const res = await getCompanionOngoingOrders({
        page: 1,
        pageSize: 20,
      });
      items.value = res.items;
    }
  } catch (e) {
    err.value = userMessageFromError(e);
    items.value = [];
  } finally {
    loading.value = false;
  }
}

function switchTab(t: "available" | "ongoing") {
  tab.value = t;
}

watch(tab, () => {
  void load();
});

useAuthGuardOnShow(() => load());

onPullDownRefresh(async () => {
  await load();
  uni.stopPullDownRefresh();
});

function shortId(id: string) {
  return id.length > 12 ? `${id.slice(0, 8)}…` : id;
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(
      d.getMinutes(),
    ).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}

function goDetail(id: string) {
  uni.navigateTo({
    url: `/pages/order/detail?orderId=${encodeURIComponent(id)}`,
  });
}

function goBack() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: "/pages/home/index" }) });
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 32rpx 48rpx;
  box-sizing: border-box;
}
.banner {
  padding: 20rpx 24rpx;
  margin-bottom: 20rpx;
  background: #fff7e6;
  border: 1rpx solid #ffe58f;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #ad6800;
  line-height: 1.5;
}
.tabs {
  display: flex;
  margin-bottom: 24rpx;
  background: #f0f0f0;
  border-radius: 12rpx;
  padding: 6rpx;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 28rpx;
  color: #666;
  border-radius: 10rpx;
}
.tab.active {
  background: #fff;
  color: #076bff;
  font-weight: 600;
}
.muted {
  font-size: 28rpx;
  color: #8f8f94;
  padding: 48rpx 0;
  text-align: center;
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
.back {
  margin-top: 40rpx;
  align-self: flex-start;
  font-size: 28rpx;
  background: #f5f5f5;
  color: #333;
}
</style>
