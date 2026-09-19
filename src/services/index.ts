import { getCacheValue, setCacheValue } from '../utils/cache';
import { TelegramService } from './telegram.service';

const TELEGRAM_API_URL = 'https://api.telegram.org';
const TELEGRAM_FILE_CACHE_TTL = 60 * 60 * 24 * 7;
const TELEGRAM_FILE_CACHE_TAG = 'telegram-file-path';
export class ImageApiService {
   private telegramService: TelegramService;

   constructor() {
      this.telegramService = new TelegramService();
   }

   async processAndSendImage(file: Buffer, caption?: string) {
      try {
         const result = await this.telegramService.sendPhoto(file, { caption });
         return {
            success: true,
            message: 'Image processed and sent successfully',
            data: result.photo,
         };
      } catch (error) {
         return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to process and send image',
            error: error,
         };
      }
   }

   async processAndSendImages(files: Buffer[], caption?: string) {
      try {
         const result = await this.telegramService.sendPhotos(files, { caption });
         return {
            success: true,
            message: 'Image processed and sent successfully',
            data: result.map((mes) => mes.photo),
         };
      } catch (error) {
         return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to process and send image',
            error: error,
         };
      }
   }

   async getFileInfo(fileId: string) {
      try {
         const cacheUrl = await getCacheValue<string>(fileId);
         const data = {
            fileId: fileId,
            downloadUrl: cacheUrl,
            filePath: 'cache',
            fileSize: 0,
            mimeType: '',
         };
         if (!cacheUrl) {
            const fileInfo = await this.telegramService.getFile(fileId);
            const file_path = fileInfo.result.file_path;
            const fileUrl = `${TELEGRAM_API_URL}/file/bot${process.env.BOT_TOKEN}/${file_path}`;
            data.downloadUrl = fileUrl;
            data.filePath = file_path;
            data.fileSize = fileInfo.result.file_size;
            data.mimeType = fileInfo.result.mime_type;
            if (file_path) {
               await setCacheValue(fileId, fileUrl, {
                  ttl: TELEGRAM_FILE_CACHE_TTL,
                  tags: [TELEGRAM_FILE_CACHE_TAG],
                  name: 'telegram-file-path',
               });
            }
         }

         return {
            success: true,
            message: 'File information retrieved successfully',
            data,
         };
      } catch (error) {
         return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to retrieve file information',
            error: error,
         };
      }
   }

   async downloadTelegramFile(filePath: string) {
      try {
         const fileBuffer = await this.telegramService.downloadFile(filePath);
         return {
            success: true,
            message: 'File downloaded successfully',
            data: fileBuffer,
         };
      } catch (error) {
         return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to download file',
            error: error,
         };
      }
   }
}
