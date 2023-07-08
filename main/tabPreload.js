const { contextBridge, BrowserWindow } = require("electron");

contextBridge.exposeInMainWorld("tab", {
  getBrowserWindow: function (id) {
    console.log(BrowserWindow)
    return BrowserWindow.fromId(id);
  },
});
