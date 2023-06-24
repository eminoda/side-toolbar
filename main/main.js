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

app.commandLine.appendSwitch("charset", "utf-8");

ipcMain.handle("main-listen", async (event, args) => {
  const { channel, ..._args } = args;
  console.log(channel, _args);
  switch (channel) {
    case "win:open":
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
      const win = new BrowserWindow({
        width: screenWidth,
        height: screenHeight,
        webPreferences: {
          preload: path.join(__dirname, "preload.js"),
        },
      });
      win.loadURL("http://localhost:5173/win");
      break;
    default:
      console.log("为实现");
      break;
  }
  return args;
});
