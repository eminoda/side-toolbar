<template>
  <div class="tag-win">
    <!-- tabs -->
    <div>{{ activeKey }}</div>
    <a-tabs v-model:activeKey="activeKey" type="editable-card" hide-add @edit="onEdit">
      <a-tab-pane class="container" :key="item.id" :tab="item.title" v-for="(item, index) in tabs" :closable="item.show">
        <!-- <div ref="winRef" style="flex: 1"></div> -->
      </a-tab-pane>
    </a-tabs>
    <div class="win-container"></div>
  </div>
</template>
.

<script setup lang="ts">
import { onMounted, ref, reactive, unref } from "vue";
import { useRoute, useRouter } from "vue-router";

const preload = electronAPI.preload;
const route = useRoute();
const router = useRouter();
const url = ref(decodeURIComponent(<string>route.query.url));
const parentWinId = ref("");
const activeKey = ref("");
const tabs = reactive(<WindowTabs[]>[]);

electronAPI.toIpcMain("current-win").then((id) => {
  parentWinId.value = String(id);
});

const onEdit = (targetKey: string | MouseEvent, action: string) => {
  if (action == "remove") {
    const historyWebview = document.querySelector(".win-container");
    historyWebview!.removeChild(document.querySelector(`[id='${targetKey}']`)!);

    if (tabs.length > 1) {
      const index = tabs.indexOf(tabs.find((tab) => tab.id == targetKey)!);
      tabs.splice(index, 1);
      activeKey.value = tabs[tabs.length - 1].id;
      const historyWebview = document.querySelectorAll(".win-container webview");
      historyWebview.forEach((item) => {
        if (item.getAttribute("id") == tabs[tabs.length - 1].id) {
          item.setAttribute("show", "");
          item.removeAttribute("hidden");
        }
      });
    } else {
      // 回到搜索窗口
      router.back();
    }
  }
};

// 创建 webview 容器
const createWebview = (url: string) => {
  console.log(`[创建新 webview] ${url}`);
  const id = String(Date.now());

  const historyWebview = document.querySelectorAll(".win-container webview");
  historyWebview.forEach((item) => {
    item.removeAttribute("show");
    item.setAttribute("hidden", "");
  });
  const webview = <Electron.WebviewTag>document.createElement("webview");
  webview.setAttribute("src", url);
  webview.setAttribute("preload", preload);
  webview.setAttribute("nodeintegration", "");
  webview.setAttribute("allowpopups", "");
  webview.setAttribute("id", id);
  webview.setAttribute("show", "");

  activeKey.value = id;

  tabs.push({
    id,
    url,
    title: "正在加载",
    show: true,
  });

  webview?.addEventListener("dom-ready", () => {
    // webview!.openDevTools();
    const winContentId = webview!.getWebContentsId();
    webview.executeJavaScript(`
        electronAPI.toIpcMain('new-win-interceptor',{winId:${parentWinId.value}})
    `);
    const title = webview.getTitle();
    const currentId = webview.getAttribute("id");
    tabs.find((tab) => tab.id == currentId)!.title = title;
  });
  webview?.addEventListener("will-navigate", ({ url }) => {
    debugger;
    createWebview(url);
  });
  document.querySelector(".win-container")?.appendChild(webview);
};

onMounted(() => {
  if (url.value) {
    createWebview(unref(url));
  }
});

electronAPI.onIpcRenderer((channel, args) => {
  console.log(args, channel);
  if (channel === "new-tab") {
    const url = args.url;
    createWebview(url, 2);
  }
});
</script>

<style scoped lang="less">
.tag-win {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 100vh;
  // :deep(.ant-tabs-content-holder) {
  //   flex: 1;
  // }
  .win-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    height: 100%;
  }
  :deep(.ant-tabs > .ant-tabs-nav, .ant-tabs > div > .ant-tabs-nav) {
    margin-bottom: 0;
  }
}
</style>
