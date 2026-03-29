"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryController = void 0;
const cloudinary_config_1 = __importDefault(require("../config/cloudinary.config"));
class CloudinaryController {
    constructor() {
        this.getUploadSignature = this.getUploadSignature.bind(this);
        this.deleteImage = this.deleteImage.bind(this);
    }
    /**
     * PUBLIC
     * Used by frontend to upload images directly to Cloudinary
     */
    getUploadSignature(req, res) {
        try {
            const timestamp = Math.round(Date.now() / 1000);
            const folder = "kangaroo/properties";
            const signature = cloudinary_config_1.default.utils.api_sign_request({
                timestamp,
                folder
            }, process.env.CLOUDINARY_API_SECRET);
            return res.json({
                success: true,
                timestamp,
                signature,
                folder,
                cloudName: process.env.CLOUDINARY_CLOUD_NAME,
                apiKey: process.env.CLOUDINARY_API_KEY
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to generate upload signature"
            });
        }
    }
    /**
     * PROTECTED
     * Deletes image from Cloudinary
     */
    async deleteImage(req, res) {
        try {
            const { publicId } = req.body; // ✅ FIXED
            if (!publicId) {
                return res.status(400).json({
                    success: false,
                    message: "publicId is required"
                });
            }
            const result = await cloudinary_config_1.default.uploader.destroy(publicId);
            if (result.result !== "ok") {
                return res.status(400).json({
                    success: false,
                    message: "Failed to delete image from Cloudinary"
                });
            }
            return res.json({
                success: true,
                message: "Image deleted successfully"
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "Image delete failed"
            });
        }
    }
}
exports.CloudinaryController = CloudinaryController;
//# sourceMappingURL=CloudinaryController.js.map