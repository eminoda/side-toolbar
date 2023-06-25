<template>
  <div>
    <div>
      <a-input v-model="url" placeholder="Basic usage" @keydown.enter="handleSearch" />
    </div>
    <a-tabs v-model:activeKey="activeKey" type="card">
      <a-tab-pane :key="index + ''" :tab="item.title" v-for="(item, index) in wins">
        <div>{{ index }}</div>
      </a-tab-pane>
    </a-tabs>
    <div v-for="(item, index) in wins">
      <!-- <webview :src="item.url" class="win"></webview> -->
      <iframe :src="item.url" frameBorder="0" @load="handleIframeLoad(index)" ref="winRef" v-show="item.show" class="win"></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
const winRef = ref<HTMLInputElement[]>([]);
const url = ref("");
const activeKey = ref("0");
const wins = reactive([
  {
    url: "http://baidu.com",
    show: true,
    title: "首页",
  },
]);
const handleSearch = () => {};
const handleIframeLoad = (index: number) => {
  console.log(index);
  activeKey.value = index + "";
  if (winRef.value) {
    const currentRef = winRef.value[index];
    setTimeout(() => {
      console.log(currentRef.contentWindow);
    }, 1000);
  }
};
electronAPI.onIpcRenderer(({ url }) => {
  wins.forEach((element) => {
    element.show = false;
  });
  wins.push({ url, show: true, title: Date.now() + "" });
});
</script>

<style scoped lang="less">
.win {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 200px;
}
</style>
