const path = require("path");
const { createWindow, getScreenDisplay } = require("../utils");
const config = require("../config/index");
const { setLogger } = require("../logger");
const logger = setLogger("window:siderBar");

exports.show = () => {
  const { workAreaSize } = getScreenDisplay();

  const rect = config.windows.siderBar;

  const position = {
    // 居右
    x: parseInt(workAreaSize.width - rect.width * 1.2),
    // 垂直居中
    y: (workAreaSize.height - rect.height) / 2,
  };

  const win = createWindow({
    // 自定义参数
    ...config.windows.siderBar,
    ...position,
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

  logger.info(`窗口 ${config.windows.search.name} 创建成功`, `${rect.width}x${rect.height}`);
  return win;
};
