const fs = require("fs");
const path = require("path");
const { app, BrowserWindow, screen, ipcMain, webFrameMain, webContents, ipcRenderer } = require("electron");

const siderBarWin = require("./win/siderBar");
const searchWin = require("./win/search");
const tabWin = require("./win/tab");
const subMenusWin = require("./win/subMenus");

app.whenReady().then(() => {
  siderBarWin();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) siderBarWin();
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
  // console.log(channel, _args);
  // 打开新窗口
  if (channel === "win:open") {
    const { name } = _args;
    if (name === "searchWin") {
      return searchWin();
    } else if (name === "tabWin") {
      return tabWin({ url: _args.url });
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

    // foreground-tab, background-tab, new-window or other
    event.sender.setWindowOpenHandler(({ url, frameName, features, disposition, referrer, postBody }) => {
      console.log("[tab window] abort open new window", `[${disposition}] ${url}`);
      win.send("renderer-listen", { channel: "new-tab", url, disposition });
      return { action: "deny" };
    });
    // HTML a tag href
    event.sender.on("will-navigate", (details) => {
      console.log("[navigate is tag a]", details.url);
      details.preventDefault();
      win.send("renderer-listen", { channel: "update-tab", url: details.url });
    });
    event.sender.session.webRequest.onBeforeSendHeaders((details, callback) => {
      if (details.resourceType == "xhr") {
        // console.log(details.url);
      }
      callback(details);
    });
  } else {
    console.log(args);
    throw new Error("ipc 方法未实现");
  }
  return args;
});
