<template>
  <!-- <div class="page" @mousemove="moveMouse">
    <div class="test">
      <div>鼠标移动坐标：{{ movePoint }}</div>
      <div>点击起始坐标：{{ startPoint }}</div>
      <div>结束坐标：{{ endPoint }}</div>
    </div>
    <div ref="moveRef" class="mouse-point" :style="movePosition">
      <plus-outlined @mousedown="startShot" @mouseup="endShot" />
    </div>
    <div class="preview-rect" :style="previewRectStyle"></div>
  </div> -->
  <div class="page" @mousemove="moveMouse">
    <img :src="screenImage" alt="" />
    <div ref="moveRef" class="mouse-point" :style="movePosition">
      <plus-outlined @mousedown="startShot" @mouseup="endShot" />
    </div>
    <div class="preview-rect" :style="previewRectStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onBeforeMount } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";

const screenImage = ref<string>("");
const isShot = ref<boolean>(false);
const moveRef = ref<HTMLElement | null>(null);

const previewRect = reactive<{ width: number; height: number }>({ width: 0, height: 0 });

const rect = reactive<{ width: number; height: number }>({ width: 0, height: 0 });
const movePoint = reactive<{ x: number; y: number }>({ x: 0, y: 0 });
const startPoint = reactive<{ x: number; y: number }>({ x: 0, y: 0 });
const endPoint = reactive<{ x: number; y: number }>({ x: 0, y: 0 });
const movePosition = computed(() => {
  return {
    left: movePoint.x + "px",
    top: movePoint.y + "px",
  };
});
const previewRectStyle = computed(() => {
  return {
    width: previewRect.width + "px",
    height: previewRect.height + "px",
    top: (movePoint.y > startPoint.y ? startPoint.y : movePoint.y) + "px",
    left: (movePoint.x > startPoint.x ? startPoint.x : movePoint.x) + "px",
  };
});

const getRect = () => {
  const rect = moveRef.value!.getClientRects()[0];
  return rect;
};
// 监听鼠标移动
const moveMouse = (e: MouseEvent) => {
  const { x, y } = e;
  const { width, height } = getRect();
  // 已通过 css transform -50% 处理
  movePoint.x = x;
  movePoint.y = y;

  if (!isShot.value) {
    return;
  }

  if (movePoint.x > startPoint.x) {
    previewRect.width = movePoint.x - startPoint.x;
  } else {
    endPoint.x = startPoint.x;
    previewRect.width = endPoint.x - movePoint.x;
  }

  if (movePoint.y > startPoint.y) {
    previewRect.height = movePoint.y - startPoint.y;
  } else {
    endPoint.y = startPoint.y;
    previewRect.height = endPoint.y - movePoint.y;
  }
};

// 清空拖拽坐标，记录起始坐标
const startShot = () => {
  const { width, height } = getRect();
  rect.width = width;
  rect.height = height;
  previewRect.height = 0;
  previewRect.width = 0;
  endPoint.x = 0;
  endPoint.y = 0;
  startPoint.x = movePoint.x;
  startPoint.y = movePoint.y;
  isShot.value = true;
};
const endShot = (e: MouseEvent) => {
  isShot.value = false;
  // TODO: canvas
};
onBeforeMount(() => {
  electronAPI.toIpcMain<string>("initPreviewScreen").then((data: string) => {
    screenImage.value = data;
  });
});
</script>

<style scoped lang="less">
.page {
  // cursor: none;
  background-color: rgba(245, 245, 245, 0.2);
  position: absolute;
  height: 100%;
  width: 100%;
  overflow: hidden;
  user-select: none;
  img {
    filter: invert(20%);
  }
  .test {
    position: absolute;
    top: 2px;
    right: 0;
  }
  .mouse-point {
    transform: translate(-50%, -50%);
    color: #333;
    opacity: 1;
    font-size: 30px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    background-color: transparent;
    width: 30px;
    height: 30px;
    line-height: 30px;
  }
  .preview-rect {
    display: inline-block;
    width: 100px;
    height: 100px;
    border: 2px dashed #fff;
    position: absolute;
    filter: brightness(99%);
  }
}
</style>
