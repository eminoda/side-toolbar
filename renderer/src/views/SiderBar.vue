<template>
  <!-- 侧边栏 -->
  <div class="side-toolbar">
    <div style="-webkit-app-region: no-drag">
      <div class="side-toolbar-icon">
        <IeOutlined style="color: #1fbbee" @click="openBrowser" class="icon" />
      </div>
      <div class="side-toolbar-icon">
        <div class="img-wrap">
          <code-outlined class="icon" />
        </div>
      </div>
      <div class="side-toolbar-icon" ref="sideToobarIconRef">
        <a-popover :getPopupContainer="() => sideToobarIconRef" v-model:visible="visible" trigger="click" placement="right">
          <template #content>
            <div class="sub-toolbar" @mouseleave="openSubMenus(false)">
              <scan-outlined class="sub-icon" />
              <expand-outlined class="sub-icon" @click="handleScreenShot" />
              <bg-colors-outlined class="sub-icon" />
            </div>
          </template>
          <experiment-outlined @mouseenter="openSubMenus(true)" class="icon" />
        </a-popover>
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
</template>

<script setup lang="ts">
import { ScanOutlined, ExpandOutlined, BgColorsOutlined, IeOutlined, SettingOutlined, CodeOutlined, ExperimentOutlined } from "@ant-design/icons-vue";
import { ref } from "vue";
const visible = ref<boolean>(false);
const timer = ref<number | null>(null);

const menuRef = ref<HTMLElement | null>(null);
const sideToobarIconRef = ref<HTMLElement | null>(null);

const openSubMenus = (_visible: boolean) => {
  if (!_visible) {
    if (timer.value) {
      clearTimeout(timer.value);
    }
    timer.value = window.setTimeout(() => {
      visible.value = _visible;
    }, 200);
  } else {
    visible.value = _visible;
  }
  // console.log(menuRef.value?.getBoundingClientRect());
  // const { left, width, height, top } = menuRef.value?.getBoundingClientRect()!;
  // electronAPI.toIpcMain("win:open", { name: "subMenusWin", type, position: { x: left * 2 + width, y: top + height / 2 } });
};
const handleScreenShot = () => {
  electronAPI.toIpcMain("openWindow", { name: "screenShot" });
};
const openBrowser = () => {
  try {
    // 打开搜索窗口
    electronAPI.toIpcMain("openWindow", { name: "search" });
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
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  .side-toolbar-icon {
    width: 60px;
    height: 60px;
    box-shadow: 0px 0px 6px 3px rgba(255, 255, 255, 0.8);
    background-color: #fff;
    border-radius: 8px;
    cursor: pointer;
    user-select: none;
    margin-bottom: 14px;
    position: relative;
    &:last-child {
      margin-bottom: 0;
    }
    .icon {
      font-size: 44px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    :deep(.ant-popover) {
      .ant-popover-arrow-content {
        background-color: rgba(145, 202, 255, 0.8);
      }
      .ant-popover-inner {
        background-color: transparent;
        .ant-popover-inner-content {
          padding: 12px;
          background-color: rgba(145, 202, 255, 0.8);
          border-radius: 8px;
          .sub-toolbar {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            .sub-icon {
              cursor: pointer;
              font-size: 30px;
              margin-bottom: 14px;
              box-shadow: 0px 0px 6px 3px rgba(255, 255, 255, 0.8);
              background-color: #fff;
              border-radius: 8px;
              padding: 4px;
              &:last-child {
                margin-bottom: 0;
              }
            }
          }
        }
      }
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
</style>
