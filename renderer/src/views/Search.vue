<template>
  <div class="page">
    <a-input class="search-input" v-model:value="keyword" placeholder="请输入查询的内容" @pressEnter="onSearch">
      <template #suffix>
        <search-outlined @click="onSearch" />
      </template>
    </a-input>
    <div class="search-type">
      <a-badge v-for="(item, index) in searchEngines" :key="index" :class="{ acitve: item.show }">
        <!-- <template #count v-if="item.show">
          <check-circle-outlined :style="{ color: 'rgb(82, 196, 26)' }" />
        </template> -->
        <a-avatar :size="40" style="background-color: #fff" @click="chooseEngine(item)">
          <template #icon>
            <img :src="item.image" alt="" />
          </template>
        </a-avatar>
      </a-badge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import queryString from "query-string";
import { SearchOutlined } from "@ant-design/icons-vue";
import { ref, reactive } from "vue";
const iconModules = import.meta.glob<string>("@/assets/images/home/icon/*.png", { import: "default", eager: true });
const keyword = ref("");
const router = useRouter();
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
      url: "https://google.com/search",
      field: "q",
      name: "chrome",
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
    router.push({
      path: "/tabWin",
      query: { url: encodeURIComponent(`${url}?${searchStr}`) },
    });
  }
};
const chooseEngine = (engine: SearchEngine) => {
  searchEngines.forEach((item) => {
    item.show = item.name == engine.name;
  });
  onSearch();
};
</script>

<style scoped lang="less">
.page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: no-repeat center url("@/assets/images/home/search-bg.png");
  background-size: cover;
  box-shadow: inset 0 0 10px 4px #999;
  .search-input {
    // display: block;
    width: 30%;
    border-radius: 100px;
    height: 46px;
    line-height: 46px;
    padding: 0 14px;
    :deep(input) {
      border-radius: 100px;
      font-size: 16px;
    }
    :deep(input::placeholder) {
      font-size: 16px;
    }
  }
  .search-type {
    margin-top: 3%;
    display: flex;
    justify-content: center;
    :deep(.ant-avatar) {
      background-color: #999;
      border-radius: 50%;
      margin-right: 20px;
      cursor: pointer;
      img {
        padding: 3px;
      }
      &:hover {
        border: 3px solid #91caff;
        box-shadow: 0 0 13px 4px #91caff;
      }
    }
    .acitve {
      :deep(.ant-avatar) {
        border: 3px solid #91caff;
        box-shadow: 0 0 13px 4px #91caff;
      }
    }
    :deep(.ant-avatar) {
      padding: 2px;
    }
  }
}
</style>
