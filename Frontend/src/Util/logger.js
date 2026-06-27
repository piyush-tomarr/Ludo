const isDebugEnabled = import.meta.env.DEV || import.meta.env.VITE_DEBUG_LOGS === "true";

export const logger = {
  debug: (...args) => {
    if (isDebugEnabled) console.debug(...args);
  },
  info: (...args) => {
    if (isDebugEnabled) console.info(...args);
  },
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args)
};
