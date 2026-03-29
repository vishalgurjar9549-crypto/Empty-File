import { Request, Response } from "express";
export declare class CloudinaryController {
    constructor();
    /**
     * PUBLIC
     * Used by frontend to upload images directly to Cloudinary
     */
    getUploadSignature(req: Request, res: Response): Response<any, Record<string, any>>;
    /**
     * PROTECTED
     * Deletes image from Cloudinary
     */
    deleteImage(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=CloudinaryController.d.ts.map