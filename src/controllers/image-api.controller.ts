import { Request, Response } from 'express';
import { Readable } from 'node:stream';
import { z } from 'zod';
import { ImageApiService } from '../services';
import { ApiResponse } from '../types';
import { getLargestImage } from '../utils/image';

const urlImageCache = new Map<string, string>();

const uploadFilesSchema = z.object({
   files: z.array(z.any()).min(1).max(10),
});

const getFileSchema = z.object({
   fileId: z.string().min(1, 'File ID is required'),
});

export class ImageApiController {
   private imageApiService: ImageApiService;

   constructor() {
      this.imageApiService = new ImageApiService();
   }

   uploadFiles = async (req: Request, res: Response) => {
      try {
         const validatedFiles = uploadFilesSchema.parse({ files: req.files || [] });
         const files = validatedFiles.files as Express.Multer.File[];
         const images = [];
         if (files.length === 1) {
            const file = files[0];
            const result = await this.imageApiService.processAndSendImage(file.buffer, req.body.caption);
            if (result.data) images.push(getLargestImage(result.data));
            else throw new Error('Telegram Error');
         } else if (files.length >= 1) {
            const result = await this.imageApiService.processAndSendImages(
               files.map((f) => f.buffer),
               req.body.caption,
            );
            result.data?.forEach((imgs) => {
               if (imgs.length > 0) images.push(getLargestImage(imgs));
               else throw new Error('Telegram Error');
            });
         }

         const response: ApiResponse = {
            success: true,
            message: `Successfully processed ${images.length} image(s)`,
            data: {
               images,
               count: images.length,
            },
         };

         res.status(200).json(response);
      } catch (error) {
         const response: ApiResponse = {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to process files',
         };
         res.status(400).json(response);
      }
   };

   sendToTelegram = async (req: Request, res: Response) => {
      try {
         if (!req.file) {
            const response: ApiResponse = {
               success: false,
               message: 'No file provided',
            };
            return res.status(400).json(response);
         }

         const result = await this.imageApiService.processAndSendImage(req.file.buffer);

         const response: ApiResponse = {
            success: result.success,
            message: result.message,
            data: result.data,
         };

         res.status(result.success ? 200 : 500).json(response);
      } catch (error) {
         const response: ApiResponse = {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to send to Telegram',
         };
         res.status(400).json(response);
      }
   };

   getFileUrl = async (req: Request, res: Response) => {
      try {
         const validatedParams = getFileSchema.parse({ fileId: req.params.fileId });

         const result = await this.imageApiService.getFileInfo(validatedParams.fileId);

         const response: ApiResponse = {
            success: result.success,
            message: result.message,
            data: result.data,
         };

         res.status(result.success ? 200 : 400).json(response);
      } catch (error) {
         const response: ApiResponse = {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get file URL',
         };
         res.status(400).json(response);
      }
   };

   getFile = async (req: Request, res: Response) => {
      try {
         const validatedParams = getFileSchema.parse({ fileId: req.params.fileId });
         const fileId = validatedParams.fileId;
         let downloadUrl = urlImageCache.get(fileId);
         if (!downloadUrl) {
            const result = await this.imageApiService.getFileInfo(fileId);
            downloadUrl = result.data?.downloadUrl;
            if (!downloadUrl) throw new Error('Failed to get file URL');
            urlImageCache.set(fileId, downloadUrl);
         }
         const response: Awaited<ReturnType<typeof fetch>> = await fetch(downloadUrl);

         if (!response.ok || !response.body) {
            return res.status(response.status).send('Image not found');
         }

         res.setHeader('Content-Type', 'image/jpeg');
         res.setHeader('Content-Disposition', 'inline');
         res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400');
         const contentLength = response.headers.get('content-length');
         if (contentLength) {
            res.setHeader('Content-Length', contentLength);
         }

         // Stream trực tiếp Telegram -> Express -> Browser
         Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]).pipe(res);
      } catch (error) {
         console.error('[Image] Error:', error);

         if (!res.headersSent) {
            return res.status(500).send('Failed to load image');
         }

         res.end();
      }
   };
}
