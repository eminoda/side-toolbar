<template>
  <div class="win">
    <div>{{ url }}</div>
    <a-tabs v-model:activeKey="activeKey" type="editable-card" hide-add @edit="onEdit">
      <a-tab-pane class="container" :key="index" :tab="item.title" v-for="(item, index) in wins" :closable="item.show">
        <iframe :src="item.url" scrolling="auto" frameBorder="0" @load="handleIframeLoad(index)" ref="winRef" class="inner-win"></iframe>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, reactive } from "vue";

const route = useRoute();
const url = decodeURIComponent(<string>route.query.url);
const winRef = ref<HTMLIFrameElement[]>([]);
const activeKey = ref(0);
const wins = reactive(<WindowIframe[]>[]);
if (url) {
  wins.push({
    url,
    show: true,
  });
  activeKey.value = 0;
}
const onEdit = (targetKey: string) => {
  wins.splice(Number(targetKey), 1);
  wins[wins.length - 1].show = true;
  activeKey.value = Number(targetKey) - 1;
};
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
  activeKey.value = wins.length - 1;
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
