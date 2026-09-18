import { NextFunction, Request, Response } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
   try {
      const apiKey = req.headers['x-api-key'] as string;
      if (!apiKey || apiKey !== process.env.X_API_KEY) {
         return res.status(403).json({
            status: false,
            message: 'Invalid API Key',
         });
      }

      next();
   } catch (error) {
      res.status(403).json({
         success: false,
         message: 'Invalid API Key',
      });
   }
};
