<template>
  <!-- 侧边栏 -->
  <div class="side-toolbar">
    <div style="-webkit-app-region: no-drag">
      <div class="inner">
        <div class="side-toolbar-icon">
          <a-tooltip placement="right">
            <!-- <template #title>新开窗口</template> -->
            <div class="img-wrap">
              <windows-outlined @click="openBrowser" />
            </div>
          </a-tooltip>
        </div>
        <div class="side-toolbar-icon">
          <a-tooltip placement="right">
            <!-- <template #title>开发</template> -->
            <div class="img-wrap">
              <!-- <tool-outlined /> -->
              <code-outlined />
            </div>
          </a-tooltip>
        </div>
        <div class="side-toolbar-icon">
          <a-tooltip placement="right">
            <!-- <template #title>实用功能</template> -->
            <div class="img-wrap">
              <experiment-outlined />
            </div>
          </a-tooltip>
        </div>
        <div class="side-toolbar-icon">
          <a-tooltip placement="right">
            <!-- <template #title>设置</template> -->
            <div class="img-wrap">
              <setting-outlined />
            </div>
          </a-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UpOutlined, DownOutlined, SettingOutlined, CodeOutlined, ExperimentOutlined, WindowsOutlined } from "@ant-design/icons-vue";

const openBrowser = () => {
  try {
    // 打开搜索窗口
    // electronAPI.toIpcMain("win:open", { name: "searchWin" });
    electronAPI.toIpcMain("win:open", { name: "tabWin", url: decodeURIComponent("https://www.baidu.com/") });
  } catch (err) {
    console.log(err);
  }
};
</script>

<style scoped lang="less">
.side-toolbar {
  -webkit-user-select: none;
  -webkit-app-region: drag;
  width: 88px;
  height: 400px;
  background-color: rgba(145, 202, 255, 0.4);
  border-radius: 8px;
  padding: 24px 14px;
  position: relative;
  .inner {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    .side-toolbar-icon {
      display: inline-block;
      width: 60px;
      height: 60px;
      box-shadow: 0px 0px 6px 3px rgba(255, 255, 255, 0.8);
      background-color: #fff;
      border-radius: 8px;
      cursor: pointer;
      user-select: none;
      margin-bottom: 12px;
      &:last-child {
        margin-bottom: 0;
      }
      .img-wrap {
        width: 100%;
        height: 100%;
        position: relative;
        :deep([role="img"]) {
          font-size: 40px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }
  }
}
</style>
