import { TelegramService } from './telegram.service';

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
         const fileInfo = await this.telegramService.getFile(fileId);
         const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${fileInfo.result.file_path}`;

         return {
            success: true,
            message: 'File information retrieved successfully',
            data: {
               fileId: fileId,
               downloadUrl: fileUrl,
               filePath: fileInfo.result.file_path,
               fileSize: fileInfo.result.file_size,
               mimeType: fileInfo.result.mime_type,
            },
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
