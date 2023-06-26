<template>
  <div class="page">
    <a-input-search class="search-input" v-model:value="keyword" placeholder="请输入查询的内容" enter-button @search="onSearch" />
    <div class="search-type">
      <a-badge v-for="(item, index) in searchEngines" :key="index">
        <template #count v-if="item.show">
          <check-circle-outlined :style="{ color: 'rgb(82, 196, 26)' }" />
        </template>
        <a-avatar :size="40" style="background-color: #fff" @click="chooseEngine(item)">
          <template #icon>
            <img :src="item.image" alt="" />
          </template>
        </a-avatar>
      </a-badge>
    </div>
    <iframe src="https://www.bilibili.com/video/BV17z4y1v7tY/?spm_id_from=333.1007.tianma.1-1-1.click&vd_source=75af4fa4191b57c31017b8df385135a1" frameborder="0"></iframe>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import queryString from "query-string";
import { CheckCircleOutlined } from "@ant-design/icons-vue";
import { ref, reactive } from "vue";
const iconModules = import.meta.glob<string>("@/assets/images/home/icon/*.png", { import: "default", eager: true });
const keyword = ref("");
// const searchEngines: SearchEngine[] = ref([{ url: "https://cn.bing.com/search", image: "", field: "" }]);
const searchEngines = reactive(
  <SearchEngine[]>[
    {
      url: "https://cn.bing.com/search",
      field: "q",
      name: "bing",
      show: true,
    },
    {
      url: "https://baidu.com/s",
      field: "wd",
      name: "baidu",
    },
  ].map(({ url, field, name, show }) => {
    const image = iconModules[<string>Object.keys(iconModules).find((path) => path.indexOf(name) !== -1)!];
    return { url, field, image, show, name };
  })
);
const onSearch = () => {
  if (keyword.value) {
    const { url, field } = searchEngines.find((item) => item.show)!;
    const searchStr = queryString.stringify({ [field]: keyword.value });
    window.open(`${url}?${searchStr}`);
  }
};
const chooseEngine = (engine: SearchEngine) => {
  searchEngines.forEach((item) => {
    item.show = item.name == engine.name;
  });
  onSearch();
};
const router = useRouter();
electronAPI.onIpcRenderer(({ url }) => {
  router.push({ path: "/win", query: { url: encodeURIComponent(url) } });
});
</script>

<style scoped lang="less">
.page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  .search-input {
    display: block;
    width: 40%;
  }
  .search-type {
    margin-top: 3%;
    display: flex;
    justify-content: center;
    :deep(.ant-badge) {
      border-radius: 50%;
      margin-right: 30px;
      cursor: pointer;
    }
    :deep(.ant-avatar) {
    }
  }
}
</style>
