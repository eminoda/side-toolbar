const { contextBridge, ipcRenderer } = require("electron");
var Mock = require("mockjs");

Mock.setup({
  timeout: 400,
});

Mock.mock(/\/unitrust-id-admin/, (...args) => {
  console.log(args)
  return {
    list: true,
  };
});

contextBridge.exposeInMainWorld("electronAPI", {
  toIpcMain: (channel, args) => {
    console.log({ channel, ...args });
    return ipcRenderer.invoke("main-listen", { channel, ...args });
  },
  onIpcRenderer: (callback) => {
    return ipcRenderer.on("renderer-listen", (event, ...args) => {
      return callback(args[0]);
    });
  },
});

window.addEventListener("DOMContentLoaded", () => {
  console.log("页面 dom 加载完毕");
});

const open = window.open;
window.open = (strUrl, strWindowName, strWindowFeatures) => {
  alert(strWindowName == "_top" ? "_blank" : strWindowName);
  console.log("复写window.open");
  open(strUrl, strWindowName == "_top" ? "_blank" : strWindowName, strWindowFeatures);
};
