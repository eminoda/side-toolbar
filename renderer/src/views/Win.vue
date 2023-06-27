<template>
  <div class="win">
    <div>{{ url }}</div>
    <a-tabs v-model:activeKey="activeKey" type="card">
      <a-tab-pane class="container" :key="item.url" :tab="item.title" v-for="(item, index) in wins">
        <iframe :src="item.url" scrolling="auto" frameBorder="0" @load="handleIframeLoad(index)" ref="winRef" class="inner-win"></iframe>
      </a-tab-pane>
    </a-tabs>
    <div v-for="(item, index) in wins">
      <!-- <iframe :src="item.url" frameBorder="0" @load="handleIframeLoad(index)" ref="winRef" v-show="item.show" class="win"></iframe> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, reactive } from "vue";

const route = useRoute();
const url = decodeURIComponent(<string>route.query.url);
const winRef = ref<HTMLIFrameElement[]>([]);
const activeKey = ref("");
const wins = reactive(<WindowIframe[]>[]);
if (url) {
  wins.push({
    url,
    show: true,
  });
  activeKey.value = wins[0].url;
}
const handleIframeLoad = (index: number) => {
  console.log("iframe loaded", winRef.value);
  // activeKey.value = index + "";
  if (winRef.value) {
    const currentRef = winRef.value[index];
    console.log(currentRef.contentDocument);
    wins[index].title = currentRef.contentDocument!.querySelector("title")!.textContent || "";

    const style = currentRef.contentDocument!.createElement("style");
    const head = currentRef.contentDocument!.querySelector("head")!;
    const cssText = `html::-webkit-scrollbar {
        width: 10px;
        height: auto;
      }
      html::-webkit-scrollbar-track {
        background: rgb(239, 239, 239);
        border-radius: 6px;
      }
      html::-webkit-scrollbar-thumb {
        background: #bfbfbf;
        border-radius: 10px;
      }
      html::-webkit-scrollbar-thumb:hover {
        background: #333;
      }
      html::-webkit-scrollbar-corner {
        background: #179a16;
      }`;
    const textNode = document.createTextNode(cssText);
    style.appendChild(textNode);
    head.appendChild(style);
  }
};
electronAPI.onIpcRenderer(({ url }) => {
  wins.forEach((element) => {
    element.show = false;
  });
  wins.push({ url, show: true, title: "" });
  activeKey.value = url;
});
</script>

<style scoped lang="less">
.win {
  .container {
    position: relative;
    height: calc(100vh - 100px);
    .inner-win {
      position: absolute;
      width: 100%;
      top: 0;
      left: 0;
      height: calc(100vh - 100px);
    }
  }
}
</style>
