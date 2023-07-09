const path = require("path");
const { app, BrowserWindow, screen, ipcMain, webFrameMain } = require("electron");

module.exports = (options = {}) => {
  const url = "http://localhost:5173";

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const win = new BrowserWindow({
    width: 88,
    height: 400,
    x: 100,
    y: parseInt((screenHeight - 400) / 2),
    resizable: false,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, "../preload.js"),
      webSecurity: true,
      nodeIntegration: true,
    },
  });

  win.loadURL(url);
  // win.webContents.openDevTools();

  return true;
};
