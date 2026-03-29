"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
function successResponse(data, message, meta) {
    const response = {
        success: true,
        data
    };
    if (message) {
        response.message = message;
    }
    if (meta) {
        response.meta = meta;
    }
    return response;
}
function errorResponse(message, details) {
    return {
        success: false,
        error: message,
        details
    };
}
//# sourceMappingURL=response.js.map