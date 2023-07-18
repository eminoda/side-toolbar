const { app, BrowserWindow, screen, ipcMain, webFrameMain, webContents, desktopCapturer } = require("electron");

const fs = require("fs");
const { setLogger } = require("./logger");
const logger = setLogger("utils");

exports.getScreenDisplay = () => {
  // https://www.electronjs.org/docs/latest/api/screen
  const primaryDisplay = screen.getPrimaryDisplay();
  const { workAreaSize, workArea, size, bounds } = primaryDisplay;
  return { workAreaSize, workArea, size, bounds };
};

/**
 * 创建 BrowserWindow 参数
 * https://www.electronjs.org/docs/latest/api/browser-window#new-browserwindowoptions
 *
 * @param {*} options
 * @param {string} options.url
 * @param {string} options.title
 * @param {boolean} options.isDebugger
 * @returns
 */

exports.createWindow = (options) => {
  try {
    const { title, url, isDebugger, name, ..._options } = options;
    if (!title) {
      throw new Error("请设置窗口标题");
    }
    if (!url) {
      throw new Error("请设置窗口加载链接");
    }
    if (isDebugger) {
      _options.webPreferences.devTools = true;
    }

    // 创建窗口
    const win = new BrowserWindow(_options);
    win.loadURL(url);

    // 设置标题
    win.on("ready-to-show", () => {
      win.setTitle(title);
    });

    if (isDebugger) {
      win.webContents.openDevTools();
    }

    return win;
  } catch (err) {
    throw err;
  }
};

const getAllWindows = () => BrowserWindow.getAllWindows();

exports.openWindow = (options = {}) => {
  try {
    if (!options.name) {
      throw new Error();
    } else if (["search", "screenShot"].includes(options.name)) {
      return require(`./windows/${options.name}`).show();
    } else {
      throw new Error(`窗口 ${options.name} 未定义`);
    }
  } catch (err) {
    throw new Error(`openWindow 异常：${err.message}`);
  }
};

exports.closeWindow = (webContents) => {
  // 获取当前窗口
  const currentWin = BrowserWindow.getAllWindows().find((win) => win.webContents.id === webContents.id);
  currentWin.close();
};

exports.preventWindowNavigate = (webContents, options) => {
  const win = BrowserWindow.fromWebContents(webContents);
  // foreground-tab, background-tab, new-window or other
  webContents.setWindowOpenHandler(({ url, frameName, features, disposition, referrer, postBody }) => {
    logger.debug("阻止新窗口打开", `[${disposition}] ${url}`);
    win.send("renderer-listen", { channel: "new-tab", url, disposition });
    return { action: "deny" };
  });
  // HTML a tag href
  webContents.on("will-navigate", (details) => {
    logger.debug("阻止a标签跳转", details.url);
    details.preventDefault();
    win.send("renderer-listen", { channel: "update-tab", url: details.url });
  });
};

exports.initPreviewScreen = async (webContents) => {
  // 获取当前窗口
  const currentWin = BrowserWindow.getAllWindows().find((win) => win.webContents.id === webContents.id);

  // 找到窗口所在屏幕
  const display = screen.getDisplayNearestPoint(currentWin.getBounds());

  // 获取屏幕内容
  const { bounds, scaleFactor } = display;
  const desktopCaputrerSources = await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: {
      width: bounds.width,
      height: bounds.height,
    },
  });

  console.log(display);

  const desktopCapturerSource = desktopCaputrerSources.find((item) => item.display_id == display.id);
  const screenImage = desktopCapturerSource.thumbnail.toDataURL();
  return screenImage;
};

exports.screenShot = async (webContents, options) => {
  try {
    // https://www.electronjs.org/docs/latest/api/web-contents#contentscapturepagerect-opts
    webContents
      .capturePage({
        x: options.x,
        y: options.y,
        width: options.width,
        height: options.height,
      })
      // https://www.electronjs.org/docs/latest/api/native-image
      .then((image) => {
        console.log(1);
        fs.writeFileSync("xxx.png", image.toPNG());
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
  }
};
