import { Response, NextFunction } from "express";
import { Request } from "express";
import { ZodSchema, ZodError } from "zod";
import { errorResponse } from "../utils/response";
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json(errorResponse("Validation failed", error.errors));
      }
      next(error);
    }
  };
}
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const normalizedQuery: any = {};

      for (const key in req.query) {
        const value = req.query[key];

        if (Array.isArray(value)) {
          normalizedQuery[key] = value.join(",");
        } else {
          normalizedQuery[key] = value;
        }
      }

      // overwrite req.query with clean values
      req.query = normalizedQuery;

      schema.parse(normalizedQuery);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json(errorResponse("Invalid query parameters", error.errors));
      }
      next(error);
    }
  };
}
