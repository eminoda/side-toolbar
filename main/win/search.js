const path = require("path");
const { app, BrowserWindow, screen, ipcMain, webFrameMain } = require("electron");

module.exports = (options = {}) => {
  const url = "http://localhost:5173/search";

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const win = new BrowserWindow({
    title: "我的浏览器",
    width: screenWidth * 0.7,
    height: screenHeight * 0.7,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, "../preload.js"),
      webSecurity: true,
      nodeIntegration: true,
      webviewTag: true,
    },
  });

  win.loadURL(url);
  win.webContents.openDevTools();

  /**
   * 覆写请求头，阻止 iframe，CSP 安全策略
   */
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    // console.log(details)
    if (details.responseHeaders["x-frame-options"]) {
      delete details.responseHeaders["x-frame-options"];
    }
    if (details.responseHeaders["X-Frame-Options"]) {
      delete details.responseHeaders["X-Frame-Options"];
    }
    if (details.responseHeaders["Content-Security-Policy"]) {
      delete details.responseHeaders["Content-Security-Policy"];
    }
    callback({ responseHeaders: { ...details.responseHeaders } });
  });

  // https://github.com/brrd/electron-tabs/blob/master/src/index.ts
  /**
   * 阻止新窗口的打开，由宿主页面提供 webview/iframe 实现
   */
  win.webContents.setWindowOpenHandler(({ url, frameName, features, disposition, referrer, postBody }) => {
    // console.log({ url, frameName, features, disposition, referrer, postBody });
    console.log("[search window] abort open new window", `[${disposition}] ${url}`);

    win.webContents.send("renderer-listen", { channel: "url-change", url });
    return { action: "deny" };
  });

  return true;
};
