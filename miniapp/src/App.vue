<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { API_BASE_URL, APP_ENV } from "@/config/env";
import { debugLog } from "@/utils/debugLog";
import { trySilentWechatLogin } from "@/services/auth-session";

onLaunch(async () => {
  debugLog("app", "launch", { env: APP_ENV, apiBase: API_BASE_URL || "(empty)" });
  const ok = await trySilentWechatLogin();
  debugLog("auth", ok ? "silent login ok" : "silent login skipped or failed");
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style></style>
