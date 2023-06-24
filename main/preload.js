const { contextBridge, ipcRenderer } = require("electron");

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
