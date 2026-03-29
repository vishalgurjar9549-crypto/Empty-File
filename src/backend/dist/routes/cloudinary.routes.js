"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CloudinaryController_1 = require("../controllers/CloudinaryController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const cloudinaryController = new CloudinaryController_1.CloudinaryController();
// ✅ SECURED: require authentication for upload signature
router.get('/signature', auth_middleware_1.authMiddleware, cloudinaryController.getUploadSignature);
// ✅ PROTECTED: delete image (OWNER only via JWT)
router.delete('/image/:publicId', auth_middleware_1.authMiddleware, cloudinaryController.deleteImage);
exports.default = router;
//# sourceMappingURL=cloudinary.routes.js.map