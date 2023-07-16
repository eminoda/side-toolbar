const path = require("path");
const { app, BrowserWindow, screen, ipcMain, webFrameMain } = require("electron");

module.exports = (options = {}) => {
  const url = "http://localhost:5173/subMenus";

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const [winX, winY] = BrowserWindow.getAllWindows()
    .find((win) => win.getTitle() == "siderBar")
    .getPosition();

  const winWidth = 84;

  const offsetX = winX > screenWidth * 0.9 ? -1 * winWidth * 2 : winWidth;
  console.log([winX, winY]);
  console.log(options.position, offsetX);
  console.log(winX + Number(offsetX));
  const win = new BrowserWindow({
    width: 60,
    height: 150,
    x: winX + offsetX,
    y: winY + options.position.y,
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
  win.on("ready-to-show", () => {
    win.setTitle("subMenus");
  });
  // win.webContents.openDevTools();

  return true;
};
