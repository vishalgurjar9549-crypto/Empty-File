import { Response, NextFunction } from 'express';
import { Request } from 'express';
import { ZodSchema } from 'zod';
export declare function validateBody(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare function validateQuery(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=validation.middleware.d.ts.map