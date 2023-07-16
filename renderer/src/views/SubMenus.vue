<template>
  <div class="win">
    <div class="inner">
      <scan-outlined class="icon" />
      <expand-outlined class="icon" @click="screenShot" />
      <bg-colors-outlined class="icon" />
    </div>
  </div>
</template>

<script setup>
import { ScanOutlined, ExpandOutlined, BgColorsOutlined, UpOutlined, DownOutlined, IeOutlined, SettingOutlined, CodeOutlined, WindowsOutlined } from "@ant-design/icons-vue";
const screenShot = () => {
  electronAPI.toIpcMain("development", { name: "search" });
};
</script>

<style scoped lang="less">
.win {
  -webkit-user-select: none;
  -webkit-app-region: drag;
  width: 60px;
  height: 150px;
  background-color: rgba(0, 0, 0, 0.2);
  //   background-color: red;
  border-radius: 6px;
  padding: 8px 8px;
  .inner {
    -webkit-app-region: no-drag;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    user-select: none;
    cursor: pointer;
    .icon {
      padding: 4px;
      font-size: 30px;
      border-radius: 4px;
      cursor: pointer;
      background-color: #fff;
      box-shadow: 0px 0px 6px 3px rgba(255, 255, 255, 0.8);
      margin-bottom: 10px;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
