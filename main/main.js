const path = require("path");
const { app, BrowserWindow, screen, ipcMain, webFrameMain } = require("electron");
const fs = require("fs");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  //   win.loadFile("index.html");
  win.loadURL("http://localhost:5173/");
  win.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("web-contents-created", (event, webContents) => {
  console.log(webContents.getTitle());
});
app.on("web-contents-created", (event, webContents) => {
  // webContents.setWindowOpenHandler(({ url, frameName, disposition }) => {
  //   console.log(url, frameName, disposition);
  //   if (url.indexOf("127.0.0.1") !== -1) {
  //     return {
  //       action: "allow",
  //       overrideBrowserWindowOptions: {
  //         frame: false,
  //         fullscreenable: false,
  //         backgroundColor: "black",
  //         webPreferences: {
  //           // preload: "my-child-window-preload-script.js",
  //         },
  //       },
  //     };
  //   } else {
  //     return { action: "deny" };
  //   }
  // });
});

app.commandLine.appendSwitch("charset", "utf-8");
app.commandLine.appendSwitch("disable-site-isolation-trials");
ipcMain.handle("main-listen", async (event, args) => {
  const { channel, ..._args } = args;
  console.log(channel, _args);
  switch (channel) {
    case "win:open":
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
      const win = new BrowserWindow({
        width: screenWidth * 0.7,
        height: screenHeight * 0.7,
        webPreferences: {
          preload: path.join(__dirname, "preload.js"),
          nodeIntegration: true,
          enableRemoteModule: true,
          // contextIsolation: false,
          webSecurity: false,
          allowRunningInsecureContent: true,
          webviewTag: true,
        },
      });
      win.loadURL("http://localhost:5173/home");
      win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        // console.log(details)
        if (details.responseHeaders["x-frame-options"]) {
          delete details.responseHeaders["x-frame-options"];
        }
        if (details.responseHeaders["Content-Security-Policy"]) {
          delete details.responseHeaders["Content-Security-Policy"];
        }
        callback({ responseHeaders: { ...details.responseHeaders } });
      });
      // 请求拦截
      win.webContents.session.webRequest.onBeforeRequest((details, cb) => {
        // Can be mainFrame, subFrame, stylesheet, script, image, font, object, xhr, ping, cspReport, media, webSocket or other
        if (details.resourceType == "xhr") {
          console.log(`[${details.id}:${details.method},${details.resourceType}]==>`, details.url);
        }
        cb(details);
      });
      win.webContents.session.webRequest.onCompleted((details) => {
        // Can be mainFrame, subFrame, stylesheet, script, image, font, object, xhr, ping, cspReport, media, webSocket or other
        if (details.resourceType == "xhr") {
          console.log(`[${details.id}:${details.method},${details.resourceType}]<==`, details.url);
          // if (details.uploadData) {
          //   console.log(details.uploadData.map((item) => item.bytes.toString()));
          // }
        }
      });
      // 覆写 a 标签 href 打开新窗口
      win.webContents.setWindowOpenHandler(({ url, frameName, features, disposition, referrer, postBody }) => {
        // console.log({ url, frameName, features, disposition, referrer, postBody });
        console.log("win--setWindowOpenHandler", url, disposition);
        // 通知渲染进程
        const title = win.webContents.getTitle();
        win.webContents.send("renderer-listen", { channel: "url-change", url });
        return { action: "deny" };
      });
      // win.webContents.on("did-start-navigation", (event, url, httpResponseCode, httpStatusText, isMainFrame, frameProcessId, frameRoutingId) => {
      //   console.log("did-start-navigation-----2");
      // });
      // win.webContents.on("will-frame-navigate", (event, url, httpResponseCode, httpStatusText, isMainFrame, frameProcessId, frameRoutingId) => {
      //   console.log("will-frame-navigate-----3");
      // });
      win.webContents.on("did-frame-navigate", (event, url, httpResponseCode, httpStatusText, isMainFrame, frameProcessId, frameRoutingId) => {
        const frame = webFrameMain.fromId(frameProcessId, frameRoutingId);
        if (frame) {
          console.log("win--did-frame-navigate", url);
          const code = fs.readFileSync(path.join(__dirname, "./proxy.js")).toString();
          console.log();
          frame.executeJavaScript(code);
        }
      });

      break;
    default:
      console.log("为实现");
      break;
  }
  return args;
});
