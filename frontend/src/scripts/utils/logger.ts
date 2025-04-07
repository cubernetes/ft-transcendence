import { LOG_LEVEL } from "../config";

export type logLevel = "debug" | "info" | "warn" | "error";

const logLevels: logLevel[] = ["debug", "info", "warn", "error"];

/** Change the log level fro dev mode here manually */
const logLevel: logLevel = process.env.NODE_ENV === "production" ? "error" : LOG_LEVEL;

/** Find the index of the current log level */
const logLevelIndex = logLevels.indexOf(logLevel);

export const logger = {
    debug: (...args: any[]) => {
        if (logLevelIndex <= logLevels.indexOf("debug")) {
            console.debug(...args);
        }
    },
    info: (...args: any[]) => {
        if (logLevelIndex <= logLevels.indexOf("info")) {
            console.info(...args);
        }
    },
    warn: (...args: any[]) => {
        if (logLevelIndex <= logLevels.indexOf("warn")) {
            console.warn(...args);
        }
    },
    error: (...args: any[]) => {
        if (logLevelIndex <= logLevels.indexOf("error")) {
            console.error(...args);
        }
    },
};
