"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.safeLogger = void 0;
const pino_1 = __importDefault(require("pino"));
// Create logger with safe configuration
const logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV !== 'production' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname'
        }
    } : undefined,
    // Redact sensitive information
    redact: {
        paths: ['password', 'token', 'authorization', 'cookie', 'secret'],
        remove: true
    }
});
exports.logger = logger;
// Safe logger wrapper that never crashes
exports.safeLogger = {
    info: (...args) => {
        try {
            if (args.length === 1) {
                logger.info(args[0]);
            }
            else {
                logger.info(args[0], args[1]);
            }
        }
        catch (error) {
            console.log('[INFO]', ...args);
        }
    },
    error: (...args) => {
        try {
            if (args.length === 1) {
                logger.error(args[0]);
            }
            else {
                logger.error(args[0], args[1]);
            }
        }
        catch (error) {
            console.error('[ERROR]', ...args);
        }
    },
    warn: (...args) => {
        try {
            if (args.length === 1) {
                logger.warn(args[0]);
            }
            else {
                logger.warn(args[0], args[1]);
            }
        }
        catch (error) {
            console.warn('[WARN]', ...args);
        }
    },
    debug: (...args) => {
        try {
            if (args.length === 1) {
                logger.debug(args[0]);
            }
            else {
                logger.debug(args[0], args[1]);
            }
        }
        catch (error) {
            console.debug('[DEBUG]', ...args);
        }
    }
};
exports.default = exports.safeLogger;
//# sourceMappingURL=logger.js.map