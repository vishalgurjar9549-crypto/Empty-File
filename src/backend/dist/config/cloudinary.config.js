"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const env_1 = require("./env");
/**
 * Cloudinary Configuration
 * Single source of truth for Cloudinary initialization
 *
 * This configuration is used by CloudinaryService and other parts of the application
 */
cloudinary_1.v2.config({
    cloud_name: env_1.env.CLOUDINARY.CLOUD_NAME,
    api_key: env_1.env.CLOUDINARY.API_KEY,
    api_secret: env_1.env.CLOUDINARY.API_SECRET,
    secure: true
});
// Export configured instance
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.config.js.map