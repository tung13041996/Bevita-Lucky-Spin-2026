
import { Prize } from './types';

// BƯỚC QUAN TRỌNG: Bạn phải dán URL Web App từ Google Apps Script vào đây
export const GOOGLE_SHEETS_SCRIPT_URL = ""; 

export const FACEBOOK_POST_URL = "https://www.facebook.com/maintp.giangvien"; 

export const INITIAL_PRIZES: Prize[] = [
  { id: 1, name: "Combo Bruno Vassari — Còn 10", qty: 10, image: "1.jpg", color: "#FFD700" },
  { id: 2, name: "Mceutic Gel Cleanser 50ml — Còn 10", qty: 10, image: "2.jpg", color: "#FF6347" },
  { id: 3, name: "Mceutic Micellar Water 50ml — Còn 10", qty: 10, image: "3.jpg", color: "#98FB98" },
  { id: 4, name: "Mceutic Balance Tonic 50ml — Còn 10", qty: 10, image: "4.jpg", color: "#87CEFA" },
  { id: 5, name: "Mceutic Gel Cleanser 150ml — Còn 5", qty: 5, image: "5.jpg", color: "#DDA0DD" },
  { id: 6, name: "Mceutic Micellar Water 200ml — Còn 5", qty: 5, image: "6.jpg", color: "#F08080" },
  { id: 7, name: "BHA Pure & Care 30ml — Còn 5", qty: 5, image: "7.jpg", color: "#E0FFFF" },
  { id: 8, name: "Zymogen Centella Serrum — Còn 5", qty: 5, image: "8.jpg", color: "#FFFACD" },
  { id: 9, name: "Toner dưỡng 2 lớp Payot — Còn 1", qty: 1, image: "9.jpg", color: "#B0C4DE" },
  { id: 10, name: "SRM da dầu Dr Anmytas 120ml — Còn 1", qty: 1, image: "10.jpg", color: "#F5DEB3" },
  { id: 11, name: "RevSkin - SRM cho da mụn — Còn 3", qty: 3, image: "11.jpg", color: "#DA70D6" },
  { id: 12, name: "Kem dưỡng ẩm da khô Ancalima — Còn 1", qty: 1, image: "12.jpg", color: "#FA8072" },
  { id: 13, name: "Christina Niacinamide Night Cream — Còn 1", qty: 1, image: "13.jpg", color: "#F0E68C" },
  { id: 14, name: "KCN cho da dầu ACM — Còn 1", qty: 1, image: "14.jpg", color: "#FFC0CB" },
  { id: 15, name: "Ivawhite - Kem sáng da, mờ nám — Còn 1", qty: 1, image: "15.jpg", color: "#E6E6FA" },
  { id: 16, name: "Ahohwa - Ampoule trắng da, mờ nám 50ml — Còn 1", qty: 1, image: "16.jpg", color: "#F5FFFA" },
  { id: 17, name: "Lì xì Voucher 50k — Còn 200", qty: 200, image: "17.jpg", color: "#FFDAB9" },
  { id: 18, name: "Lì xì Voucher 100k — Còn 200", qty: 200, image: "18.jpg", color: "#FFE4B5" },
  { id: 19, name: "Lì xì Voucher 200k — Còn 200", qty: 200, image: "19.jpg", color: "#FFE4C4" },
  { id: 20, name: "Lì xì Voucher 500k — Còn 50", qty: 50, image: "20.jpg", color: "#FAEBD7" },
];

export const ASSETS = {
  logo: "picture-bevita/logo.jpg",
  sounds: {
    spin: "https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3",
    fireworks: "https://assets.mixkit.co/active_storage/sfx/1993/1993-preview.mp3"
  },
  prizeImagePath: "picture-bevita/"
};
