const path = require("path");
const { app, BrowserWindow, screen, ipcMain } = require("electron");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  //   win.loadFile("index.html");
  win.loadURL("http://localhost:5173/");
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
        },
      });
      win.loadURL("http://localhost:5173/win");
      win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        if (details.responseHeaders["Content-Security-Policy"]) {
          delete details.responseHeaders["Content-Security-Policy"];
        }
        callback({ responseHeaders: { ...details.responseHeaders } });
      });
      // 覆写 a 标签 href 打开新窗口
      win.webContents.setWindowOpenHandler(({ url, frameName, disposition }) => {
        console.log(url, frameName, disposition);
        if (url.indexOf("127.0.0.1") !== -1) {
          return {
            action: "allow",
            overrideBrowserWindowOptions: {
              frame: false,
              fullscreenable: false,
              backgroundColor: "black",
              webPreferences: {
                // preload: "my-child-window-preload-script.js",
              },
            },
          };
        } else {
          // 通知渲染进程
          win.webContents.send("renderer-listen", { channel: "url-change", url });
          return { action: "deny" };
        }
      });

      // win.webContents.on("did-create-window", (window, details) => {
      //   console.log("did-create-window", details.url);
      //   console.log(window.webContents, window.webContents.title);
      // });
      break;
    default:
      console.log("为实现");
      break;
  }
  return args;
});
