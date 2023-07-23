<template>
  <div :style="{ cursor: cursor }" class="screen-shot">
    <!-- 调试信息 -->
    <!-- <div class="test">
      <div v-for="(item, index) in points" :key="index">{{ item }}</div>
    </div> -->
    <!-- 屏幕源图片 -->
    <img id="sourcePic" :src="screenImage" @load="imageToCanvas" alt="" v-show="false" />
    <!-- 剪裁画布 -->
    <canvas id="shotCanvas" ref="shotCanvasRef" @mousedown="startMouse" @mousemove="moveMouse" @mouseup="stopMouse" @keydown="keyEscDown"></canvas>
    <!-- 生成画布 -->
    <canvas id="resultCanvas" ref="resultCanvasRef" v-show="false"></canvas>
    <div class="panel" :style="panelPosition" v-if="showPanel">
      <download-outlined @click="downPic" />
      <check-outlined :style="{ color: '#389e0d' }" @click="downPic(true)" />
      <close-outlined :style="{ color: '#cf1322' }" @click="cancelWindow" />
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
import { reactive, ref, computed, onBeforeMount, onMounted, onUnmounted } from "vue";
import { DownloadOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons-vue";

const shotCanvasRef = ref<HTMLCanvasElement | null>(null);
const resultCanvasRef = ref<HTMLCanvasElement | null>(null);

const startPoint = reactive({
  x: 0,
  y: 0,
});
const moveStartPoint = reactive({
  x: 0,
  y: 0,
});
const endPoint = reactive({
  x: 0,
  y: 0,
});
const movePoint = reactive({
  x: 0,
  y: 0,
});

const isMouseDown = ref(false);
const isMoving = ref(false);
const showPanel = ref(false);

// 判断鼠标是否在裁剪图之内
const inMove = computed(() => {
  // 左上到右下↘，右上到左下↙，右下到左上↖，左下到右上↗
  if (
    (movePoint.x > startPoint.x && movePoint.x < endPoint.x && movePoint.y > startPoint.y && movePoint.y < endPoint.y) ||
    (movePoint.x < startPoint.x && movePoint.x > endPoint.x && movePoint.y > startPoint.y && movePoint.y < endPoint.y) ||
    (movePoint.x < startPoint.x && movePoint.x > endPoint.x && movePoint.y < startPoint.y && movePoint.y > endPoint.y) ||
    (movePoint.x > startPoint.x && movePoint.x < endPoint.x && movePoint.y < startPoint.y && movePoint.y > endPoint.y)
  ) {
    return true;
  }

  return false;
});

const points = computed(() => {
  return [
    [endPoint.x > startPoint.x ? startPoint.x : endPoint.x, endPoint.y > startPoint.y ? startPoint.y : endPoint.y],
    [endPoint.x > startPoint.x ? endPoint.x : startPoint.x, endPoint.y > startPoint.y ? startPoint.y : endPoint.y],
    [endPoint.x > startPoint.x ? endPoint.x : startPoint.x, endPoint.y > startPoint.y ? endPoint.y : startPoint.y],
    [endPoint.x > startPoint.x ? startPoint.x : endPoint.x, endPoint.y > startPoint.y ? endPoint.y : startPoint.y],
  ];
});

const panelPosition = computed(() => {
  const { height } = getPicRect();
  return {
    top: (height - points.value[3][1] < 200 ? points.value[0][1] - 60 : points.value[3][1] + 10) + "px",
    left: points.value[2][0] - 110 + "px",
  };
});

const direction = ref("");
const cursor = computed(() => {
  if (inMove.value) {
    return "move";
  } else if (isMouseDown.value) {
    return "crosshair";
  }
  for (let i = 0; i < points.value.length; i++) {
    const [x, y] = points.value[i];
    if ((i == 0 || i == 2) && Math.abs(movePoint.x - x) < 5 && Math.abs(movePoint.y - y) < 5) {
      return "se-resize";
    } else if ((i == 1 || i == 3) && Math.abs(movePoint.x - x) < 5 && Math.abs(movePoint.y - y) < 5) {
      return "sw-resize";
    }
  }
  return "default";
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

const screenImage = ref<string>("");

// 图片加载完后，初始化剪裁画布
const imageToCanvas = () => {
  if (shotCanvasRef.value) {
    const { width, height } = getPicRect();
    shotCanvasRef.value.width = width;
    shotCanvasRef.value.height = height;

    if (resultCanvasRef.value) {
      resultCanvasRef.value.width = width;
      resultCanvasRef.value.height = height;
      const resultContext = resultCanvasRef.value.getContext("2d");
      if (resultContext) {
        drawImage(resultContext);
      }
    }
    const shotContext = shotCanvasRef.value.getContext("2d");
    if (shotContext) {
      drawMask(shotContext);
      drawImage(shotContext);
      shotContext.save();
    }
  }
};

// 绘制遮罩层
const drawMask = (context: CanvasRenderingContext2D) => {
  const { width, height } = getPicRect();
  context.clearRect(0, 0, width, height);
  // context.save();
  context.fillStyle = "rgba(0,0,0,0.5)";
  context.fillRect(0, 0, width, height);
  // context.restore();
};

// 绘制背景图
const drawImage = (context: CanvasRenderingContext2D) => {
  const { width, height, imgSource } = getPicRect();
  context.globalCompositeOperation = "destination-over"; //在源图像上显示目标图像。将背景图至于底部
  context.drawImage(imgSource, 0, 0, width, height);
};

const drawPoint = (context: CanvasRenderingContext2D, dx: number = 0, dy: number = 0) => {
  // 绘制坐标
  context.globalCompositeOperation = "source-over";
  context.fillStyle = "#2CABFF";
  // top-left
  context.fillRect(startPoint.x - 5 + dx, startPoint.y - 5 + dy, 10, 10);
  // top-right
  context.fillRect(endPoint.x - 5 + dx, startPoint.y - 5 + dy, 10, 10);
  // bottom-left
  context.fillRect(startPoint.x - 5 + dx, endPoint.y - 5 + dy, 10, 10);
  // bottom-right
  context.fillRect(endPoint.x - 5 + dx, endPoint.y - 5 + dy, 10, 10);
};
const startMouse = (e: MouseEvent) => {
  showPanel.value = false;
  if (inMove.value) {
    isMoving.value = true;
    moveStartPoint.x = e.x;
    moveStartPoint.y = e.y;
  } else {
    isMouseDown.value = true;
    for (let i = 0; i < points.value.length; i++) {
      const [x, y] = points.value[i];
      if (Math.abs(e.x - x) <= 5 && Math.abs(e.y - y) <= 5) {
        if (i == 0) {
          direction.value = "top-left";
          return;
        } else if (i == 1) {
          direction.value = "top-right";
          return;
        } else if (i == 2) {
          direction.value = "bottom-right";
          return;
        } else if (i == 3) {
          direction.value = "bottom-left";
          return;
        }
      }
    }
    direction.value = "";
    startPoint.x = e.x;
    startPoint.y = e.y;
  }
};

const moveMouse = (e: MouseEvent) => {
  if (shotCanvasRef.value) {
    const shotContext = shotCanvasRef.value.getContext("2d");
    if (shotContext) {
      // 移动切图层
      if (isMoving.value) {
        drawMask(shotContext);
        const dx = e.x - moveStartPoint.x;
        const dy = e.y - moveStartPoint.y;
        console.log(dx, dy);

        shotContext.clearRect(startPoint.x + dx, startPoint.y + dy, endPoint.x - startPoint.x, endPoint.y - startPoint.y);
        drawPoint(shotContext, dx, dy);
        drawImage(shotContext);
      } // 鼠标点击后才开始绘制
      else if (isMouseDown.value) {
        // 绘制遮罩层
        drawMask(shotContext);
        // 如果更改镂空矩形大小，重新定义起末坐标
        if (direction.value) {
          if (direction.value === "top-left") {
            startPoint.x = e.x;
            startPoint.y = e.y;
            endPoint.x = points.value[2][0];
            endPoint.y = points.value[2][1];
          } else if (direction.value === "top-right") {
            startPoint.x = points.value[3][0];
            startPoint.y = points.value[3][1];
            endPoint.x = e.x;
            endPoint.y = e.y;
          } else if (direction.value === "bottom-left") {
            endPoint.x = points.value[1][0];
            endPoint.y = points.value[1][1];
            startPoint.x = e.x;
            startPoint.y = e.y;
          } else if (direction.value === "bottom-right") {
            startPoint.x = points.value[0][0];
            startPoint.y = points.value[0][1];
            endPoint.x = e.x;
            endPoint.y = e.y;
          }
        } else {
          endPoint.x = e.x;
          endPoint.y = e.y;
        }
        // 绘制镂空
        shotContext.clearRect(startPoint.x, startPoint.y, endPoint.x - startPoint.x, endPoint.y - startPoint.y);
        drawPoint(shotContext);
        drawImage(shotContext);
      }
      // 绘制鼠标
      else {
        movePoint.x = e.x;
        movePoint.y = e.y;
      }
    }
  }
};

const stopMouse = (e: MouseEvent) => {
  isMouseDown.value = false;
  if (isMoving.value) {
    const dx = e.x - moveStartPoint.x;
    const dy = e.y - moveStartPoint.y;
    startPoint.x = points.value[0][0] + dx;
    startPoint.y = points.value[0][1] + dy;
    endPoint.x = points.value[2][0] + dx;
    endPoint.y = points.value[2][1] + dy;
    moveStartPoint.x = 0;
    moveStartPoint.y = 0;
    isMoving.value = false;
  }
  showPanel.value = true;
};

const downPic = (isClipboard: boolean) => {
  // 下载图片
  const resultContext = resultCanvasRef.value!.getContext("2d");
  const img = resultContext!.getImageData(startPoint.x, startPoint.y, endPoint.x - startPoint.x, endPoint.y - startPoint.y);
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = endPoint.x - startPoint.x;
  tempCanvas.height = endPoint.y - startPoint.y;
  const tempContext = tempCanvas!.getContext("2d");
  tempContext?.putImageData(img, 0, 0);

  if (isClipboard) {
    tempCanvas.toBlob((blob) => {
      if (blob) {
        console.log(blob);
        navigator.clipboard
          .write([
            new ClipboardItem({
              [blob.type]: blob,
            }),
          ])
          .then(() => {
            cancelWindow();
          });
      }
    });
  } else {
    const a = document.createElement("a");
    // 获取图片
    a.href = tempCanvas.toDataURL("png");
    // 下载图片
    a.download = `${new Date().getTime()}.png`;
    a.click();
  }
};

const cancelWindow = () => {
  electronAPI.toIpcMain("closeWindow");
};

const keyEscDown = (e: KeyboardEvent) => {
  if (e.key == "Escape") {
    cancelWindow();
  }
};

onBeforeMount(() => {
  electronAPI.toIpcMain<string>("initPreviewScreen").then((data: string) => {
    screenImage.value = data;
  });
});

onMounted(() => {
  window.addEventListener("keydown", keyEscDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", keyEscDown);
});
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
    display: flex;
    background-color: #f0f5ff;
    border-radius: 10px;
    padding: 10px 14px;
    :deep([role="img"]) {
      font-size: 20px;
      margin-right: 10px;
      cursor: pointer;
      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
