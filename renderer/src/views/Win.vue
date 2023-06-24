<template>
  <div>
    <div>
      <a-input v-model="url" placeholder="Basic usage" @keydown.enter="handleKeyBoard($event)" />
    </div>
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane :key="index" :tab="item.url" v-for="(item, index) in wins"></a-tab-pane>
    </a-tabs>

    <iframe :src="item.url" frameBorder="0" v-for="(item, index) in wins" :key="index"></iframe>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";

const url = ref("");
const wins = reactive([
  {
    url: "http://baidu.com",
    show: true,
  },
]);
onMounted(() => {
  electronAPI.onIpcRenderer(({ url }) => {
    wins.forEach((element) => {
      element.show = false;
    });
    wins.push({ url, show: true });
  });
});
</script>

<style scoped lang="less">
iframe {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 100px;
}
</style>
