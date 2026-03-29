"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
const zod_1 = require("zod");
const response_1 = require("../utils/response");
function validateBody(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json((0, response_1.errorResponse)('Validation failed', error.errors));
            }
            next(error);
        }
    };
}
function validateQuery(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json((0, response_1.errorResponse)('Invalid query parameters', error.errors));
            }
            next(error);
        }
    };
}
//# sourceMappingURL=validation.middleware.js.map