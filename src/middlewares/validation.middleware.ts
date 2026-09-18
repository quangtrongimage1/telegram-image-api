import { z, ZodSchema, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

export class ValidationMiddleware {
    static validate(schema: ZodSchema, data: any) {
        try {
            return schema.parse(data);
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map(err => 
                    `${err.path.join('.')}: ${err.message}`
                ).join(', ');
                throw new Error(errorMessages);
            }
            throw error;
        }
    }

    static validateRequest(schema: ZodSchema) {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                const validatedData = ValidationMiddleware.validate(schema, req.body);
                req.body = validatedData;
                next();
            } catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Validation failed'
                });
            }
        };
    }
}
