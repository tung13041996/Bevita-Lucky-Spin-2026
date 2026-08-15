import { Prize } from './types';

// Weights nhân ×10, tổng = 1000, để giữ chính xác 30.90% và 0.10%
export const INITIAL_PRIZES: Prize[] = [
  {
    id: 1, name: "Voucher 10%", weight: 309,
    condition: "Áp dụng cho tất cả các đơn hàng",
    color: "#F4845F",
  },
  {
    id: 2, name: "Voucher 15%", weight: 150,
    condition: "Áp dụng cho tất cả các đơn hàng",
    color: "#118AB2",
  },
  {
    id: 3, name: "Voucher 20%", weight: 1,
    condition: "Áp dụng cho tất cả các đơn hàng",
    color: "#E63946",
  },
  {
    id: 4, name: "Voucher 300K (MP)", weight: 50,
    condition: "Áp dụng đơn hàng từ 2 triệu",
    color: "#FFBF69",
  },
  {
    id: 5, name: "Voucher 500K (MP)", weight: 50,
    condition: "Áp dụng đơn hàng từ 4 triệu",
    color: "#9B5DE5",
  },
  {
    id: 6, name: "Voucher 800K (MP)", weight: 50,
    condition: "Áp dụng cho đơn hàng từ 6 triệu",
    color: "#C77DFF",
  },
  {
    id: 7, name: "Voucher DV 500K", weight: 100,
    condition: "Dùng cho tất cả dịch vụ tại Bevita",
    color: "#FEE440",
  },
  {
    id: 8, name: "Voucher DV 800K", weight: 100,
    condition: "Dùng cho tất cả dịch vụ tại Bevita",
    color: "#00BBF9",
  },
  {
    id: 9, name: "Tặng 1 hộp bông tẩy trang 113k", weight: 50,
    condition: "CHÚC MỪNG BẠN ĐÃ NHẬN ĐƯỢC QUÀ TẶNG TỪ MAI - BEVITA\n" +
        "BÔNG TẨY TRANG CAO CẤP BEVITA TRỊ GIÁ 113K\n" +
        "(khi phát sinh bất kỳ đơn hàng nào từ nay đến 30/9)",
    color: "#C8F7C5",
  },
  {
    id: 10, name: "Tặng 1 túi mỹ phẩm Bevita 200k", weight: 10,
    condition: "CHÚC MỪNG BẠN ĐÃ NHẬN ĐƯỢC QUÀ TẶNG TỪ MAI - BEVITA\n" +
        "TÚI MỸ PHẨM CAO CẤP BEVITA TRỊ GIÁ 200K\n" +
        "(khi phát sinh bất kỳ đơn hàng nào từ nay đến 30/9)",
    color: "#FFDDD2",
  },
  {
    id: 11, name: "Tặng 1 SP peel 450k", weight: 10,
    condition: "CHÚC MỪNG BẠN ĐÃ NHẬN ĐƯỢC QUÀ TẶNG TỪ MAI - BEVITA\n" +
        "CHEMICAL PEEL RENEWAL 450K\n" +
        "(khi phát sinh bất kỳ đơn hàng nào từ nay đến 30/9)",
    color: "#BDE0FE",
  },
  {
    id: 12, name: "Tặng combo Travel Kit Mceutic 350k", weight: 120,
    condition: "CHÚC MỪNG BẠN ĐÃ NHẬN ĐƯỢC QUÀ TẶNG TỪ MAI - BEVITA\n" +
        "COMBO MCEUTIC TRỊ GIÁ 350K\n" +
        "(khi phát sinh bất kỳ đơn hàng nào từ nay đến 30/9)",
    color: "#FF99C8",
  },
];
// Tổng: 309+150+1+50+50+50+100+100+50+10+10+120 = 1000 ✓

export const ASSETS = {
  sounds: {
    spin: "https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3",
    fireworks: "https://assets.mixkit.co/active_storage/sfx/1993/1993-preview.mp3",
  },
};