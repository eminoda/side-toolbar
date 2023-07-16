<template>
  <div class="page" @mousemove="moveMouse">
    <div class="test">
      <div>鼠标移动坐标：{{ movePoint }}</div>
      <div>点击起始坐标：{{ startPoint }}</div>
      <div>结束坐标：{{ endPoint }}</div>
    </div>
    <!-- 指针 -->
    <div ref="moveRef" class="mouse-point" :style="movePosition">
      <plus-outlined @mousedown="startShot" @mouseup="endShot" />
    </div>
    <div class="preview-rect" :style="previewRectStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";

const isShot = ref<boolean>(false);
const moveRef = ref<HTMLElement | null>(null);
const currentPoint = reactive<{ top: number; left: number }>({ top: 0, left: 0 });

const previewRect = reactive<{ width: number; height: number }>({ width: 0, height: 0 });

const rect = reactive<{ width: number; height: number }>({ width: 0, height: 0 });
const movePoint = reactive<{ x: number; y: number }>({ x: 0, y: 0 });
const startPoint = reactive<{ x: number; y: number }>({ x: 0, y: 0 });
const endPoint = reactive<{ x: number; y: number }>({ x: 0, y: 0 });
const middlePoint = reactive<{ x: number; y: number }>({ x: 0, y: 0 });
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
    top: movePoint.y + rect.height / 2 > startPoint.y ? startPoint.y : movePoint.y + rect.height / 2 + "px",
    left: movePoint.x + rect.width / 2 > startPoint.x ? startPoint.x : movePoint.x + rect.width / 2 + "px",
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
  // 减去 icon 半宽半高
  movePoint.x = x - width / 2;
  movePoint.y = y - height / 2;

  if (movePoint.x + width / 2 > startPoint.x) {
    previewRect.width = movePoint.x - startPoint.x + width / 2;
  } else {
    endPoint.x = startPoint.x;
    previewRect.width = endPoint.x - movePoint.x - width / 2;
  }

  if (movePoint.y + height / 2 > startPoint.y) {
    previewRect.height = movePoint.y - startPoint.y + height / 2;
  } else {
    endPoint.y = startPoint.y;
    previewRect.height = endPoint.y - movePoint.y - height / 2;
  }
};
const startShot = () => {
  const { width, height } = getRect();
  rect.width = width;
  rect.height = height;
  previewRect.height = 0;
  previewRect.width = 0;
  middlePoint.x = 0;
  middlePoint.y = 0;
  endPoint.x = 0;
  endPoint.y = 0;
  startPoint.x = movePoint.x + width / 2;
  startPoint.y = movePoint.y + height / 2;
};
const endShot = (e: MouseEvent) => {
  const { x, y } = e;
  // endPoint.x = x - movePoint.x;
  // endPoint.y = y - movePoint.y;
  console.log(previewRect);
  console.log(startPoint, middlePoint);
};
</script>

<style scoped lang="less">
.page {
  // cursor: none;
  background-color: rgba(245, 245, 245, 0.2);
  height: 100vh;
  .test {
    position: absolute;
    top: 2px;
    right: 0;
  }
  .mouse-point {
    color: #333;
    opacity: 1;
    font-size: 30px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    background-color: aquamarine;
    width: 30px;
    height: 30px;
    line-height: 30px;
  }
  .preview-rect {
    display: inline-block;
    width: 100px;
    height: 100px;
    border: 1px dashed #fff;
    position: absolute;
  }
}
</style>
