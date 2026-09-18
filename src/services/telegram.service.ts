import axios from 'axios';
import FormData from 'form-data';
import { SendPhotosOptions, TelegramRespon } from '../types';

export class TelegramService {
   async sendMessage(text: string, chatId?: string) {
      try {
         const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
         const response = await axios.post(url, {
            chat_id: chatId || process.env.CHAT_ID,
            text,
            parse_mode: 'HTML',
         });
         return response.data;
      } catch (error) {
         console.error('[Telegram] Error:', error);
         throw error;
      }
   }

   async sendPhoto(file: Buffer, options?: SendPhotosOptions) {
      try {
         const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`;
         const formData = new FormData();
         formData.append('photo', file, 'photo.jpg');

         if (options?.caption) formData.append('caption', options?.caption);
         formData.append('chat_id', process.env.CHAT_ID);

         const response = await axios.post(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
         });
         if (response.status !== 200) throw new Error(response.statusText);
         return response.data?.result as TelegramRespon;
      } catch (error) {
         console.error('[Telegram] Error sending photo:', error);
         throw error;
      }
   }
   /**
    * Send multiple photos as one Telegram media group.
    *
    * Telegram allows a media group to contain 2-10 photos.
    */
   public async sendPhotos(files: Buffer[], options?: SendPhotosOptions) {
      try {
         if (files.length < 2) {
            throw new Error('sendPhotos requires at least 2 photos');
         }

         if (files.length > 10) {
            throw new Error('Telegram allows a maximum of 10 photos per media group');
         }

         const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMediaGroup`;

         const formData = new FormData();

         const media = files.map((_, index) => ({
            type: 'photo',
            media: `attach://photo_${index}`,
         }));

         formData.append('chat_id', process.env.CHAT_ID!);

         if (options?.caption) {
            media[0] = {
               ...media[0],
            };
         }

         formData.append('media', JSON.stringify(media));

         files.forEach((file, index) => {
            formData.append(`photo_${index}`, file, {
               filename: `photo_${index}.jpg`,
               contentType: 'image/jpeg',
            });
         });

         const response = await axios.post(url, formData, {
            headers: {
               ...formData.getHeaders(),
            },

            // Cho phép upload ảnh lớn.
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
         });
         if (response.status !== 200) throw new Error(response.statusText);

         return response.data?.result as TelegramRespon[];
      } catch (error) {
         console.error('[Telegram] Error sending photos:', error);

         throw error;
      }
   }

   async getFile(fileId: string) {
      try {
         const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getFile`;
         const response = await axios.get(url, {
            params: { file_id: fileId },
         });
         return response.data;
      } catch (error) {
         console.error('[Telegram] Error getting file:', error);
         throw error;
      }
   }

   async downloadFile(filePath: string) {
      try {
         const url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`;
         const response = await axios.get(url, { responseType: 'arraybuffer' });
         return response.data;
      } catch (error) {
         console.error('[Telegram] Error downloading file:', error);
         throw error;
      }
   }
}
