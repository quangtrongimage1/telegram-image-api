/**
 * Chuyển đổi tổng số giây thành định dạng ngày, giờ, phút, giây.
 *
 * @param seconds - Tổng số giây
 * @returns Chuỗi thời gian dạng "x ngày x giờ x phút x giây"
 */
export function formatSeconds(seconds: number): string {
   const days = Math.floor(seconds / 86400);
   const hours = Math.floor((seconds % 86400) / 3600);
   const minutes = Math.floor((seconds % 3600) / 60);
   const remainingSeconds = Math.floor(seconds % 60);
   const text: string[] = [];
   if (days > 0) text.push(`${days} ngày`);
   if (hours > 0) text.push(`${hours} giờ`);
   if (minutes > 0) text.push(`${minutes} phút`);
   text.push(`${remainingSeconds} giây`);
   return text.join(' ');
}
