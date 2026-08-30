import winston from "winston";
import path from "path";
import fs from "fs";

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp, controller, action, route }) =>
            `[${timestamp}] [${controller || "-"}] [${action || "-"}] ${route || "-"} - ${level}: ${message}`
        )
      ),
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    })
  ],
});

export default logger;