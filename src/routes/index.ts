import { Router } from 'express';
import multer from 'multer';
import { ImageApiController } from '../controllers/image-api.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export function createImageApiRoutes(controller: ImageApiController): Router {
   const router = Router();

   // File upload and process routes
   const upload = multer({ storage: multer.memoryStorage() });
   router.post('/upload', authMiddleware, upload.array('files', 10), controller.uploadFiles);
   router.post('/send-telegram', authMiddleware, upload.single('file'), controller.sendToTelegram);
   router.get('/view/:fileId', controller.getFileUrl);

   return router;
}

export function createImageRoutes(controller: ImageApiController): Router {
   const router = Router();
   router.get('/:fileId', controller.getFile);
   return router;
}
