"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const cloudinary_1 = require("cloudinary");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
/**
 * CloudinaryService
 * Handles Cloudinary upload signature generation and image management
 */
class CloudinaryService {
    constructor() {
        // Verify Cloudinary is configured
        if (!env_1.env.CLOUDINARY.CLOUD_NAME || !env_1.env.CLOUDINARY.API_KEY || !env_1.env.CLOUDINARY.API_SECRET) {
            throw new Error('Cloudinary credentials not configured');
        }
        // Configure Cloudinary (idempotent - safe to call multiple times)
        cloudinary_1.v2.config({
            cloud_name: env_1.env.CLOUDINARY.CLOUD_NAME,
            api_key: env_1.env.CLOUDINARY.API_KEY,
            api_secret: env_1.env.CLOUDINARY.API_SECRET,
            secure: true
        });
        logger_1.logger.info('CloudinaryService initialized', {
            cloudName: env_1.env.CLOUDINARY.CLOUD_NAME,
            apiKey: env_1.env.CLOUDINARY.API_KEY.substring(0, 6) + '***'
        });
    }
    /**
     * Generate upload signature for client-side uploads
     * The signature must include ALL parameters that will be sent to Cloudinary
     */
    generateSignature(paramsToSign) {
        const timestamp = Math.floor(Date.now() / 1000);
        // Prepare params for signing (must match what client sends)
        const signatureParams = {
            timestamp,
            ...paramsToSign
        };
        // Generate signature using Cloudinary's utility
        const signature = cloudinary_1.v2.utils.api_sign_request(signatureParams, env_1.env.CLOUDINARY.API_SECRET);
        logger_1.logger.info('Generated Cloudinary signature', {
            timestamp,
            folder: paramsToSign.folder
        });
        return {
            signature,
            timestamp,
            ...paramsToSign // Include all params that were signed
        };
    }
    /**
     * Delete multiple images from Cloudinary
     */
    async deleteImages(imageUrls) {
        if (!imageUrls?.length)
            return;
        const results = await Promise.allSettled(imageUrls.map(async (url) => {
            const publicId = this.extractPublicId(url);
            if (!publicId) {
                logger_1.logger.warn('Could not extract public ID from URL', {
                    url
                });
                return;
            }
            try {
                const result = await cloudinary_1.v2.uploader.destroy(publicId);
                logger_1.logger.info('Deleted image from Cloudinary', {
                    publicId,
                    result
                });
                return result;
            }
            catch (error) {
                logger_1.logger.error('Failed to delete image from Cloudinary', {
                    publicId,
                    error
                });
                throw error;
            }
        }));
        // Log summary
        const successful = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;
        logger_1.logger.info('Cloudinary batch delete completed', {
            successful,
            failed,
            total: imageUrls.length
        });
    }
    /**
     * Extract Cloudinary public ID from URL
     * Example: https://res.cloudinary.com/cloud/image/upload/v1234567890/folder/image.jpg
     * Returns: folder/image
     */
    extractPublicId(url) {
        try {
            // Match pattern: /v{version}/{public_id}.{extension}
            const match = url.match(/\/v\d+\/(.+)\.\w+$/);
            return match ? match[1] : null;
        }
        catch (error) {
            logger_1.logger.error('Error extracting public ID', {
                url,
                error
            });
            return null;
        }
    }
    /**
     * Validate if URL is a valid Cloudinary URL
     */
    isValidCloudinaryUrl(url) {
        return typeof url === 'string' && url.includes('res.cloudinary.com') && url.includes(env_1.env.CLOUDINARY.CLOUD_NAME);
    }
}
exports.CloudinaryService = CloudinaryService;
//# sourceMappingURL=CloudinaryService.js.map