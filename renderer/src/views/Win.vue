<template>
  <div>
    <div>{{ url }}</div>
    <a-tabs v-model:activeKey="activeKey" type="card">
      <a-tab-pane :key="item.url" :tab="item.title" v-for="(item, index) in wins">
        <iframe :src="item.url" frameBorder="0" @load="handleIframeLoad(index)" ref="winRef" class="win"></iframe>
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
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
