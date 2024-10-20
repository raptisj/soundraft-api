import { pino } from "pino";

const logger = pino({
  level: "trace",
  transport: {
    target: "pino-pretty",
  },
});

export { logger };

// logger.trace("Hello World trace");
// logger.debug({ user: { name: "John" } }, "Hello World debug");
// logger.info("Hello World info");
// logger.warn("Hello World warn");
// logger.error("Hello World error");
// logger.fatal("Hello World fatal");
