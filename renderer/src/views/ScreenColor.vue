<template>
  <div :style="{ cursor: 'crosshair' }" class="screen-shot">
    <!-- 调试信息 -->
    <!-- <div class="test">
      <div v-for="(item, index) in points" :key="index">{{ item }}</div>
    </div> -->
    <!-- 屏幕源图片 -->
    <img id="sourcePic" :src="screenImage" @load="imageToCanvas" alt="" v-show="false" />
    <!-- 剪裁画布 -->
    <canvas id="shotCanvas" ref="shotCanvasRef" @mousemove="moveMouse"></canvas>
    <div class="panel" :style="panelPosition">
      <div v-for="(item, index) in panelColorArr" :key="index" class="line">
        <span v-for="(pc, _index) in item" :key="_index" :style="{ background: `rgba(${pc.color})`, border: `${pc.axis[0] == pc.axis[1] && pc.axis[1] == Math.floor(panelColorArr.length / 2) ? '1px solid #333' : ''}` }"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 替换 canvas 实现截屏
 * 1. 主线程读取 screen 媒体信息，转化为 image
 * 2. 将 image 转化为 canvas 作为页面背景（窗口置顶）
 * 3.
 */
import { reactive, ref, onBeforeMount, computed } from "vue";

const shotCanvasRef = ref<HTMLCanvasElement | null>(null);
const resultCanvasRef = ref<HTMLCanvasElement | null>(null);

const movePoint = reactive({
  x: 0,
  y: 0,
});

const screenImage = ref<string>("");
const SIDER_COUNT = ref<number>(21);

interface PanelColor {
  point: number[];
  axis: number[];
  color: number[];
}
const panelColors = reactive<PanelColor[]>([]);
const panelColorArr = computed(() => {
  const arr = <PanelColor[][]>[];
  for (let i = 0; i < SIDER_COUNT.value; i++) {
    arr.push([]);
  }
  panelColors.forEach((ele, index) => {
    arr[Math.floor(index / SIDER_COUNT.value)].push(ele);
  });
  return arr;
});
const panelPosition = computed(() => {
  return {
    top: movePoint.y + 10 + "px",
    left: movePoint.x + 10 + "px",
  };
});

const getPicRect = () => {
  const sourcePic = <HTMLImageElement>document.querySelector("#sourcePic");
  if (!sourcePic) {
    return {
      width: 0,
      height: 0,
      imgSource: null,
    };
  }
  return {
    width: sourcePic.width,
    height: sourcePic.height,
    imgSource: sourcePic,
  };
};

// 1. 加载桌面屏幕
onBeforeMount(() => {
  electronAPI.toIpcMain<string>("initPreviewScreen").then((data: string) => {
    screenImage.value = data;
  });
});

// 2. 图片加载完后，绘制画布
const imageToCanvas = () => {
  if (shotCanvasRef.value) {
    const { width, height, imgSource } = getPicRect();
    shotCanvasRef.value.width = width;
    shotCanvasRef.value.height = height;

    const shotContext = shotCanvasRef.value.getContext("2d");
    if (shotContext) {
      shotContext.clearRect(0, 0, width, height);
      shotContext.globalCompositeOperation = "destination-over"; //在源图像上显示目标图像。将背景图至于底部
      shotContext.drawImage(imgSource!, 0, 0, width, height);
      shotContext.save();
    }
  }
};

const drawColorPanel = (shotContext: CanvasRenderingContext2D, x: number, y: number) => {
  const { width, height, imgSource } = getPicRect();
  const half = Math.floor(SIDER_COUNT.value / 2);
  let index = 0;
  for (let yAxis = 0; yAxis < SIDER_COUNT.value; yAxis++) {
    // x轴，左至右
    for (let xAxis = 0; xAxis < SIDER_COUNT.value; xAxis++) {
      const _x = xAxis <= half ? x - half + xAxis : x + xAxis - half;
      const _y = yAxis <= half ? y - half + yAxis : y + yAxis - half;
      const point = [_x, _y];
      panelColors[index] = {
        axis: [xAxis, yAxis],
        point,
        color: shotContext.getImageData(_x, _y, 1, 1).data.map((item) => item),
      };
      index++;
    }
  }
  console.log(panelColors);
};

// 3. 监听鼠标移动坐标
const moveMouse = (e: MouseEvent) => {
  if (shotCanvasRef.value) {
    const shotContext = shotCanvasRef.value.getContext("2d");
    if (shotContext) {
      // 绘制鼠标
      movePoint.x = e.x;
      movePoint.y = e.y;
      drawColorPanel(shotContext, e.x, e.y);
      // const { data } = shotContext.getImageData(e.x - 1, e.y - 1, 1, 1);
      // data.forEach((item, index: number) => {
      //   movePointImageData[index] = item;
      // });
    }
  }
};
</script>

<style scoped lang="less">
.screen-shot {
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
  #shotCanvas {
    position: absolute;
    top: 0;
    left: 0;
    //   width: 100%;
    //   height: 100%;
  }
  .test {
    position: absolute;
    left: 10px;
    top: 10px;
    z-index: 999;
    color: #fff;
  }
  .panel {
    position: absolute;
    z-index: 50;
    background-color: #f0f5ff;
    border-radius: 10px;
    padding: 10px 14px;
    .line {
      display: flex;
      justify-content: flex-start;
      span {
        width: 10px;
        height: 10px;
        display: inline-block;
        margin-right: 2px;
        margin-bottom: 2px;
      }
    }
  }
}
</style>
