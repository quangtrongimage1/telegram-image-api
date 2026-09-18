import { TelegramImage } from '../types';

export function getLargestImage(images: TelegramImage[]): TelegramImage | undefined {
   return images.reduce<TelegramImage | undefined>((largest, image) => {
      if (!largest || image.width > largest.width) return image;
      return largest;
   }, undefined);
}
