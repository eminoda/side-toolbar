const path = require("path");
const { app, BrowserWindow, screen, ipcMain, webFrameMain } = require("electron");

module.exports = (options = {}) => {
  const url = "http://localhost:5173/home";

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const win = new BrowserWindow({
    title: "new tab",
    width: screenWidth * 0.7,
    height: screenHeight * 0.7,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, "../preload.js"),
      nodeIntegration: true,
      webviewTag: true,
    },
  });
  win.loadURL("http://localhost:5173/tabWin");

  win.webContents.on("dom-ready", () => {
    win.webContents.send("renderer-listen", { channel: "current-win", id: win.id });
  });
  win.webContents.openDevTools();

  return true;
};