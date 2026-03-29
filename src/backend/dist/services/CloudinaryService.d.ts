/**
 * CloudinaryService
 * Handles Cloudinary upload signature generation and image management
 */
export declare class CloudinaryService {
    constructor();
    /**
     * Generate upload signature for client-side uploads
     * The signature must include ALL parameters that will be sent to Cloudinary
     */
    generateSignature(paramsToSign: Record<string, any>): {
        signature: string;
        timestamp: number;
    };
    /**
     * Delete multiple images from Cloudinary
     */
    deleteImages(imageUrls: string[]): Promise<void>;
    /**
     * Extract Cloudinary public ID from URL
     * Example: https://res.cloudinary.com/cloud/image/upload/v1234567890/folder/image.jpg
     * Returns: folder/image
     */
    private extractPublicId;
    /**
     * Validate if URL is a valid Cloudinary URL
     */
    isValidCloudinaryUrl(url: string): boolean;
}
//# sourceMappingURL=CloudinaryService.d.ts.map