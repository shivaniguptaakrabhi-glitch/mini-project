import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

type Schemas = { body?: ZodType; params?: ZodType; query?: ZodType };

export const validate =
  (schemas: Schemas) => (req: Request, res: Response, next: NextFunction) => {
    for (const key of ["body", "params", "query"] as const) {
      const schema = schemas[key];
      if (!schema) continue;
      const result = schema.safeParse(req[key]);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.issues.map((i) => ({
            field: `${key}.${i.path.join(".")}`,
            message: i.message,
          })),
        });
      }
      // Express 5: req.query is a getter, so redefine it instead of assigning
      Object.defineProperty(req, key, { value: result.data, writable: true, configurable: true });
    }
    next();
  };