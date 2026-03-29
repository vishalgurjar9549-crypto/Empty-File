declare const logger: import("pino").Logger<never>;
export declare const safeLogger: {
    info: (...args: any[]) => void;
    error: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    debug: (...args: any[]) => void;
};
export { logger };
export default safeLogger;
//# sourceMappingURL=logger.d.ts.map