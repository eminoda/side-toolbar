const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

contextBridge.exposeInMainWorld("electronAPI", {
  toIpcMain: (channel, args) => {
    console.log("[IPC] renderer to main", { channel, ...args });
    return ipcRenderer.invoke("main-listen", { channel, ...args });
  },

  onIpcRenderer: (callback) => {
    return ipcRenderer.on("renderer-listen", (event, ...args) => {
      console.log("[IPC] main to renderer", args);
      const { channel, ..._args } = args[0];
      return callback(channel, _args);
    });
  },
  preload: path.resolve(__dirname, "./preload.js"),
  mock: path.resolve(__dirname, "./mock.js"),
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
