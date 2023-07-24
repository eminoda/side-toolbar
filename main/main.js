const fs = require("fs");
const path = require("path");
const { app, BrowserWindow, screen, ipcMain, webFrameMain, webContents, ipcRenderer } = require("electron");

const { openWindow, hideExcludeWFocusedindow, savePic, closeWindow, preventWindowNavigate, initPreviewScreen } = require("./utils");
const { setLogger } = require("./logger");
const logger = setLogger("main");

const siderBarWindow = require("./windows/siderBar");

const searchWin = require("./win/search");
const subMenusWin = require("./win/subMenus");

app.whenReady().then(() => {
  logger.info("app ready");
  siderBarWindow.show();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) siderBarWindow.show();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("web-contents-created", (event, webContents) => {
  console.log(webContents.getTitle());
});

app.commandLine.appendSwitch("ignore-certificate-errors");

ipcMain.handle("main-listen", async (event, args) => {
  const { channel, ..._args } = args;
  // https://www.electronjs.org/docs/latest/api/structures/ipc-main-invoke-event
  const { processId, frameId, sender, senderFrame } = event;
  // console.log(channel, _args);
  logger.debug("收到 renderer 参数", args);
  // 打开窗口
  try {
    if (channel === "openWindow") {
      openWindow(_args);
    } else if (channel === "preventWindowNavigate") {
      preventWindowNavigate(sender, _args);
    } else if (channel === "initPreviewScreen") {
      return initPreviewScreen(sender, _args);
    } else if (channel === "hideExcludeWFocusedindow") {
      return hideExcludeWFocusedindow(_args);
    } else if (channel === "savePic") {
      return savePic(sender, _args);
    } else if (channel === "closeWindow") {
      return closeWindow(sender);
    }
  } catch (err) {
    logger.error(err.message);
    throw err;
  }
  return;
  // 打开新窗口
  if (channel === "win:open") {
    const { name } = _args;
    if (name === "searchWin") {
      return searchWin();
    } else if (name === "subMenusWin") {
      const { position, type } = _args;
      return subMenusWin({ position, type });
    } else {
      throw new Error("window name is not defined");
    }
  } else if (channel === "current-win") {
    const allWins = BrowserWindow.getAllWindows();
    const winContentId = event.sender.id;
    const winId = allWins.find((win) => win.webContents.id === winContentId).id;
    return winId;
  } else if (channel === "new-win-interceptor") {
    // 父窗口
    // const allWins = BrowserWindow.getAllWindows();
    // const winContentId = event.sender.id;
    // const winId = allWins.find((win) => win.webContents.id == winContentId).id;
    const winId = _args.winId;
    const win = BrowserWindow.fromId(winId);

    event.sender.session.webRequest.onBeforeSendHeaders((details, callback) => {
      if (details.resourceType == "xhr") {
        // console.log(details.url);
      }
      callback(details);
    });
  } else if (channel === "development") {
    const allWins = BrowserWindow.getAllWindows();
    const win = allWins.find((win) => win.getTitle() === "subMenus");
    catchScreen(win);
  } else {
    console.log(args);
    throw new Error("ipc 方法未实现");
  }
  return args;
});
