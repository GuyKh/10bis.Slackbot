import * as winston from "winston";
import * as path from "path";

export module logger {
// Set this to whatever, by default the path of the script.
var logPath = __dirname;

const tsFormat = () => (new Date().toISOString());

const errorLog = new (winston.Logger)({
    transports: [
        new winston.transports.File({
            filename: path.join(logPath, "errors.log"),
            timestamp: tsFormat,
            level: process.env.LOG_LEVEL})
    ]
});

const accessLog = new (winston.Logger)({
    transports: [
        new winston.transports.File({
            filename: path.join(logPath, "access.log"),
            timestamp: tsFormat,
            level: process.env.LOG_LEVEL})
    ]
});

module.exports = {
    errorLog: errorLog,
    accessLog: accessLog
};
}