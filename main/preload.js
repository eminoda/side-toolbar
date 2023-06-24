const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  toIpcMain: (channel, args) => {
    console.log({ channel, ...args })
    return ipcRenderer.invoke("main-listen", { channel, ...args });
  },
});

window.addEventListener("DOMContentLoaded", () => {
  console.log("页面 dom 加载完毕");
});
