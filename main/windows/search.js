const path = require("path");
const { createWindow, getScreenDisplay } = require("../utils");
const config = require("../config/index");
const { setLogger } = require("../logger");
const logger = setLogger("window:search");

exports.show = () => {
  const { workAreaSize } = getScreenDisplay();

  const rect = {
    width: workAreaSize.width * 0.7,
    height: workAreaSize.height * 0.7,
  };

  const win = createWindow({
    // 自定义参数
    ...config.windows.search,
    ...rect,
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

  win.webContents.on("will-navigate", (details) => {
    details.preventDefault();
    logger.debug("阻止a标签跳转", details.url);
    win.send("renderer-listen", { channel: "update-tab", url: details.url });
  });
};

// https://github.com/brrd/electron-tabs/blob/master/src/index.ts
/**
 * 阻止新窗口的打开，由宿主页面提供 webview/iframe 实现
 */
// win.webContents.setWindowOpenHandler(({ url, frameName, features, disposition, referrer, postBody }) => {
//   // console.log({ url, frameName, features, disposition, referrer, postBody });
//   logger.info("拦截新窗口", `[${disposition}] ${url}`);

//   win.webContents.send("renderer-listen", { channel: "url-change", url });
//   return { action: "deny" };
// });

/**
 * 覆写请求头，阻止 iframe，CSP 安全策略
 */
//   win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
//     // console.log(details)
//     if (details.responseHeaders["x-frame-options"]) {
//       delete details.responseHeaders["x-frame-options"];
//     }
//     if (details.responseHeaders["X-Frame-Options"]) {
//       delete details.responseHeaders["X-Frame-Options"];
//     }
//     if (details.responseHeaders["Content-Security-Policy"]) {
//       delete details.responseHeaders["Content-Security-Policy"];
//     }
//     callback({ responseHeaders: { ...details.responseHeaders } });
//   });
