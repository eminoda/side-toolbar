<template>
  <div class="win">
    <a-input v-model:value="url" placeholder="Basic usage" @pressEnter="openNewWin" />
    <!-- <a-tabs v-model:activeKey="activeKey" type="editable-card" hide-add @edit="onEdit"> -->
    <!-- <a-tab-pane class="container" :key="index" :tab="item.title" v-for="(item, index) in wins" :closable="item.show"> -->
    <!-- <iframe :src="item.url" scrolling="auto" frameBorder="0" @load="handleIframeLoad(index)" ref="winRef" class="inner-win"></iframe> -->
    <!-- <webview :src="item.url" class="inner-win" ref="webviewRef"></webview> -->
    <!-- </a-tab-pane> -->
    <!-- </a-tabs> -->
    <!-- <div id="winParent" class="container"></div> -->
    <a-tabs v-model:activeKey="activeKey" type="editable-card" hide-add @edit="onEdit" style="flex: 1">
      <a-tab-pane class="container" :key="index" :tab="item.title" v-for="(item, index) in wins" :closable="item.show">
        <div ref="winRef" style="flex: 1"></div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
.

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, reactive, onMounted, watchEffect, nextTick } from "vue";

const webviewRef = ref<Electron.WebviewTag[] | null>([]);
const winRef = ref<HTMLElement[] | null>([]);
const route = useRoute();
const url = ref(decodeURIComponent(<string>route.query.url));

const activeKey = ref(0);
const wins = reactive(<WindowIframe[]>[]);

watchEffect(() => {
  // if (Array.isArray(webviewRef.value) && webviewRef.value.length > 0) {
  //   debugger;
  //   const webview = webviewRef.value![wins.length - 1];
  //   console.log(webview, webviewRef);
  // }
});

const openNewWin = () => {
  window.open(url.value, "_blank");
};

const onEdit = (targetKey: string) => {
  wins.splice(Number(targetKey), 1);
  wins[wins.length - 1].show = true;
  activeKey.value = Number(targetKey) - 1;
};

const didFinishLoad = () => {
  console.log(1);
};
const createWebView = (url: string) => {
  console.log("[createWebview]", url);
  const webview = <Electron.WebviewTag>document.createElement("webview");
  let title = "";
  webview.setAttribute("src", url);
  webview.setAttribute("preload", electronAPI.mock);
  webview.setAttribute("nodeintegration", "");
  webview.setAttribute("allowpopups", "");
  // webview.setAttribute("class", "inner-win");

  webview.addEventListener("did-finish-load", () => {});
  // 注入 mock
  webview.addEventListener("dom-ready", () => {
    console.log("dom-ready");
    wins[wins.length - 1].title = webview.getTitle();
    webview.openDevTools();

    webview.executeJavaScript(`

      //https://github.com/electron/electron/issues/23722
      (function(){
        var script = document.createElement("script");
        script.src = "http://localhost:5173/mock-min.js";
        script.onload = script.onreadystatechange = function () {
          try{
            const list = _Mock.getMockApiList()
            console.log(list)
            list.forEach(item=>{
              console.log(item)
              Mock.mock(new RegExp(item.template),()=>{
                return item.responseData
              })
            })
          }catch(err){
            console.log(err)
          };0
        }
        document.body.appendChild(script);
      })(window)
    `);
    // dom 已经加载完毕
  });
  webview.addEventListener("did-frame-navigate", (_url) => {
    console.log("[did-frame-navigate]", url);
  });
  // document.querySelector("#parent")?.appendChild(webview);
  wins.push({ title: "", id: String(Date.now()), url, show: false });
  nextTick(() => {
    const index = wins.length - 1;
    winRef.value![index].appendChild(webview);
  });
};

onMounted(() => {
  debugger;
  createWebView(url.value);
});

electronAPI.onIpcRenderer((channel, { url }) => {
  createWebView(url);
});
</script>

<style scoped lang="less">
.win {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
  min-height: 100vh;
  :deep(.ant-tabs-content-holder) {
    display: flex;
  }
  :deep(.ant-tabs-tabpane) {
    display: flex;
  }
}
</style>
