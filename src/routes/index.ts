import { Router } from 'express';
import multer from 'multer';
import { ImageApiController } from '../controllers/image-api.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload and process multiple images
 *     description: Upload up to 10 images and send them to Telegram for processing
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 minItems: 1
 *                 maxItems: 10
 *               caption:
 *                 type: string
 *                 description: Optional caption for the images
 *     responses:
 *       '200':
 *         description: Successfully processed images
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/send-telegram:
 *   post:
 *     summary: Send a single image to Telegram
 *     description: Upload and send a single image to Telegram
 *     tags: [Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Successfully sent to Telegram
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       '400':
 *         description: No file provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/view/{fileId}:
 *   get:
 *     summary: Get file URL by ID
 *     description: Get the Telegram file URL for a given file ID
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: Telegram file ID
 *     responses:
 *       '200':
 *         description: File URL retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUrlResponse'
 *       '400':
 *         description: Invalid file ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error
 */

export function createImageApiRoutes(controller: ImageApiController): Router {
   const router = Router();

   // File upload and process routes
   const upload = multer({ storage: multer.memoryStorage() });
   router.post('/upload', authMiddleware, upload.array('files', 10), controller.uploadFiles);
   router.post('/send-telegram', authMiddleware, upload.single('file'), controller.sendToTelegram);
   router.get('/view/:fileId', controller.getFileUrl);

   return router;
}

/**
 * @swagger
 * /view/{fileId}:
 *   get:
 *     summary: View image by file ID
 *     description: Stream and display an image directly from Telegram by file ID
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: Telegram file ID
 *     responses:
 *       '200':
 *         description: Image streamed successfully
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       '404':
 *         description: Image not found
 *       '500':
 *         description: Failed to load image
 */

export function createImageRoutes(controller: ImageApiController): Router {
   const router = Router();
   router.get('/:fileId', controller.getFile);
   return router;
}
