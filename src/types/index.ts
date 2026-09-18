export interface ApiResponse<T = any> {
   success: boolean;
   message?: string;
   data?: T;
   error?: string;
}

export interface FileUpload {
   fieldname: string;
   originalname: string;
   encoding: string;
   mimetype: string;
   size: number;
   buffer: Buffer;
}

export interface SendPhotosOptions {
   caption?: string;
}

export interface TelegramImage {
   file_id: string;
   file_unique_id: string;
   file_size: number;
   width: number;
   height: number;
}

export interface TelegramRespon {
   message_id: number;
   from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username: string;
   };
   chat: {
      id: number;
      first_name: string;
      last_name: string;
      username: string;
      type: string;
   };
   date: string;
   photo: TelegramImage[];
}
