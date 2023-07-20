<template>
  <img id="sourcePic" src="@/assets/images/desk.png" alt="" @load="imageToCanvas" v-show="false" />
  <canvas id="bgCanvas" ref="bgCanvasRef"></canvas>
  <canvas id="shotCanvas" ref="shotCanvasRef"></canvas>
</template>

<script setup lang="ts">
/**
 * 替换 canvas 实现截屏
 * 1. 主线程读取 screen 媒体信息，转化为 image
 * 2. 将 image 转化为 canvas 作为页面背景（窗口置顶）
 * 3.
 */
import DateBody from "ant-design-vue/lib/vc-picker/panels/DatePanel/DateBody";
import { reactive, ref, computed, onBeforeMount } from "vue";

const bgCanvasRef = ref<HTMLCanvasElement | null>(null);
const shotCanvasRef = ref<HTMLCanvasElement | null>(null);
const imageToCanvas = () => {
  const sourcePic = <HTMLImageElement>document.querySelector("#sourcePic");
  if (bgCanvasRef.value) {
    // bgCanvasRef.value.width = sourcePic.width;
    // bgCanvasRef.value.height = sourcePic.height;
    // const context = bgCanvasRef.value.getContext("2d");
    // if (context) {
    //   context.drawImage(sourcePic, 0, 0, sourcePic.width, sourcePic.height);
    //   // context.save()
    //   // context.globalCompositeOperation = "source-atop";
    // }
    if (shotCanvasRef.value) {
      shotCanvasRef.value.width = sourcePic.width;
      shotCanvasRef.value.height = sourcePic.height;
      const context2 = shotCanvasRef.value.getContext("2d");
      if (context2) {
        context2.clearRect(0, 0, sourcePic.width, sourcePic.height);
        context2.save();
        // 遮罩层
        context2.fillStyle = "rgba(0,0,0,0.5)";
        context2.fillRect(0, 0, sourcePic.width, sourcePic.height);
        // context2.globalCompositeOperation = "source-atop";

        // 挖孔，绘制镂空
        context2.clearRect(100, 100, 150, 150);
        // context2.globalCompositeOperation = "source-over";
        // 绘制移动坐标
        context2.fillStyle = "#2CABFF";
        context2.fillRect(100 - 5, 100 - 5, 10, 10);

        // context2.restore();
        // context2.save();
        context2.globalCompositeOperation = "destination-over"; //在源图像上显示目标图像。将背景图至于底部
        context2.drawImage(sourcePic, 0, 0, sourcePic.width, sourcePic.height);
        // context2.restore();

        const img = context2.getImageData(100, 100, 150, 150);
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = 150;
        tempCanvas.height = 150;
        const tempContext = tempCanvas!.getContext("2d");
        tempContext?.putImageData(img, 0, 0);
        const a = document.createElement("a");
        // 获取图片
        a.href = tempCanvas.toDataURL("png");
        // 下载图片
        a.download = `${new Date().getTime()}.png`;
        a.click();
      }
    }
  }
};
</script>

<style scoped lang="less">
#shotCanvas {
  position: absolute;
  top: 0;
  left: 0;
  //   width: 100%;
  //   height: 100%;
}
</style>
