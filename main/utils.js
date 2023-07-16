const { app, BrowserWindow, screen, ipcMain, webFrameMain, webContents } = require("electron");

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

exports.catchScreen = (windowBrowser) => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // https://www.electronjs.org/docs/latest/api/web-contents#contentscapturepagerect-opts
  windowBrowser.webContents
    .capturePage({
      x: 0,
      y: 0,
      width: screenWidth,
      height: screenHeight,
    })
    // https://www.electronjs.org/docs/latest/api/native-image
    .then((image) => {
      fs.writeFileSync("./" + Date.now() + ".png", image.toPNG());
    });
};
