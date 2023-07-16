const log4js = require("log4js");

log4js.configure({
  appenders: {
    out: { type: "console" },
    error: {
      type: "logLevelFilter",
      appender: "errorFile",
      level: "error",
    },
    errorFile: { type: "file", filename: "log/error.log" },
  },
  categories: {
    // fallback 输出
    default: { appenders: ["out", "error"], level: "debug" },
  },
});

exports.setLogger = (category) => {
  const logger = log4js.getLogger(category);
  return {
    info: (...args) => logger.info(...args),
    debug: (...args) => logger.debug(...args),
    error: (...args) => logger.error(...args),
  };
};
