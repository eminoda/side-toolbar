<template>
  <div class="tag-win">
    <a-input v-model:value="url" spellcheck="false">
      <template #addonBefore>
        <a-select v-model:value="protocol" style="width: 90px">
          <a-select-option value="http://">http://</a-select-option>
          <a-select-option value="https://">https://</a-select-option>
        </a-select>
      </template>
    </a-input>
    <!-- tabs -->
    <a-tabs v-model:activeKey="activeKey" type="editable-card" hide-add @edit="onEdit">
      <!-- <template slot="renderTabBar">1</template> -->
      <a-tab-pane class="container" :key="item.id" v-for="item in tabs" :closable="item.show">
        <template #tab>{{ item.title }}</template>
      </a-tab-pane>
    </a-tabs>
    <div class="win-container"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Modal } from "ant-design-vue";

const preload = electronAPI.preload;
const route = useRoute();
const router = useRouter();

const url = ref("");
const protocol = ref<string>("http://");
const host = ref("");

const parseUrl = (_url: string) => {
  try {
    const result = new URL(_url);
    protocol.value = result.protocol + "//";
    url.value = result.href.replace(protocol.value, "");
    host.value = result.host;
  } catch (err) {}
};

const activeKey = ref("");
const tabs = reactive(<WindowTabs[]>[]);

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

const urlChangeDialog = (url: string) => {
  Modal.confirm({
    content: `将要跳转链接：${url}`,
    onOk: () => {
      createWebview(url);
    },
  });
};

// 创建 webview 容器
const createWebview = (url: string) => {
  debugger;
  parseUrl(url);

  console.log(`[创建新 webview] ${url}`);
  const id = String(Date.now());

  // 将历史 webview 设置隐藏
  const historyWebview = document.querySelectorAll(".win-container webview");
  historyWebview.forEach((item) => {
    // 根据 isCreateTab 判断是否开新 tab 页，考虑回退麻烦，先注释掉
    // if (!isCreateTab && index === historyWebview.length - 1) {
    //   alert("1");
    //   item.setAttribute("src", url);
    // } else {
    //   item.removeAttribute("show");
    //   item.setAttribute("hidden", "");
    // }
    item.removeAttribute("show");
    item.setAttribute("hidden", "");
  });

  // if (isCreateTab) {

  // 创建新的 webview
  const webview = <Electron.WebviewTag>document.createElement("webview");
  webview.setAttribute("src", url);
  webview.setAttribute("preload", preload);
  webview.setAttribute("nodeintegration", "");
  webview.setAttribute("allowpopups", "");
  webview.setAttribute("id", id);
  webview.setAttribute("show", ""); // 显示
  // webview.setAttribute("disablewebsecurity", "");

  tabs.push({
    id,
    url,
    title: "正在加载",
    show: true,
    ...new URL(url),
  });
  activeKey.value = id;

  webview?.addEventListener("dom-ready", () => {
    // webview.openDevTools();
    console.log("webview dom ready ...");
    webview.executeJavaScript(`
        console.log('窗口加载完毕')
        electronAPI.toIpcMain('preventWindowNavigate')
    `);
    webview.executeJavaScript(`
    //https://github.com/electron/electron/issues/23722
      (function(){
        // var script = document.createElement("script");
        // script.src = "https://cdn.jsdelivr.net/npm/mockjs@1.1.0/dist/mock-min.min.js";
        // script.onload = script.onreadystatechange = function () {
        //   try{
        //     console.log('mockjs is ready...')
        //     const list = electronAPI.getMockApiList()
        //     list.forEach(item=>{
        //       Mock.mock(new RegExp(item.template),()=>{
        //         debugger
        //         return item.responseData
        //       })
        //     })
        //   }catch(err){
        //     console.log(err)
        //   };0
        // }
        // document.body.appendChild(script);
      })(window)
    `);
    const title = webview.getTitle();
    const currentId = webview.getAttribute("id");
    tabs.find((tab) => tab.id == currentId)!.title = title;
  });
  document.querySelector(".win-container")?.appendChild(webview);
  // }
};

onMounted(() => {
  const _url = <string>route.query.url ? decodeURIComponent(<string>route.query.url) : "";
  if (_url) {
    createWebview(_url);
  }
});

electronAPI.onIpcRenderer((channel, args) => {
  debugger;
  const { url } = args;
  console.log(args, channel);
  if (channel === "new-tab") {
    urlChangeDialog(url);
    // createWebview(url, true);
  }
  // a标签本窗口刷新
  else if (channel === "update-tab") {
    urlChangeDialog(url);
    // createWebview(url, false);
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
