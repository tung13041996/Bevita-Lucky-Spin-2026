import {Prize} from './types';

// Weights ×10, tổng = 1000 (30.90% và 0.10% giữ chính xác)
export const INITIAL_PRIZES: Prize[] = [
    {
        id: 1, name: "Voucher 10%", weight: 309,
        condition: "Áp dụng cho tất cả các đơn hàng",
        color: "#f4845f",
    },
    {
        id: 2, name: "Voucher 15%", weight: 150,
        condition: "Áp dụng cho tất cả các đơn hàng",
        color: "#118ab2",
    },
    {
        id: 3, name: "Voucher 20%", weight: 1,
        condition: "Áp dụng cho tất cả các đơn hàng",
        color: "#e63946",
    },
    {
        id: 4, name: "Voucher 300K cho hoá đơn MP", weight: 50,
        condition: "Áp dụng đơn hàng từ 2 triệu",
        color: "#ffbf69",
    },
    {
        id: 5, name: "Voucher 500K cho hoá đơn MP", weight: 50,
        condition: "Áp dụng đơn hàng từ 4 triệu",
        color: "#9b5de5",
    },
    {
        id: 6, name: "Voucher 800K cho hoá đơn MP", weight: 50,
        condition: "Áp dụng cho đơn hàng từ 6 triệu",
        color: "#c77dff",
    },
    {
        id: 7, name: "Voucher 500K cho dịch vụ tại Bevita", weight: 100,
        condition: "Áp dụng tất cả dịch vụ tại Bevita, khi có phát sinh đơn hàng",
        color: "#fee440",
    },
    {
        id: 8, name: "Voucher 800K cho dịch vụ tại Bevita", weight: 100,
        condition: "Áp dụng tất cả dịch vụ tại Bevita, khi có phát sinh đơn hàng",
        color: "#00bbf9",
    },
    {
        id: 9, name: "Tặng miễn phí 1 hộp bông tẩy trang trị giá 113k", weight: 50,
        condition: "CHÚC MỪNG BẠN ĐÃ NHẬN ĐƯỢC QUÀ TẶNG TỪ MAI - BEVITA\n" +
            "BÔNG TẨY TRANG CAO CẤP BEVITA TRỊ GIÁ 113K\n" +
            "(khi phát sinh bất kỳ đơn hàng nào từ nay đến 30/9)",
        color: "#c8f7c5",
    },
    {
        id: 10, name: "Tặng miễn phí 1 túi mỹ phẩm Bevita trị giá 200k", weight: 10,
        condition: "CHÚC MỪNG BẠN ĐÃ NHẬN ĐƯỢC QUÀ TẶNG TỪ MAI - BEVITA\n" +
            "TÚI MỸ PHẨM CAO CẤP BEVITA TRỊ GIÁ 200K\n" +
            "(khi phát sinh bất kỳ đơn hàng nào từ nay đến 30/9)",
        color: "#ffddd2",
    },
    {
        id: 11, name: "Tặng miễn phí 1 sản phẩm peel trị giá 450k", weight: 10,
        condition: "CHÚC MỪNG BẠN ĐÃ NHẬN ĐƯỢC QUÀ TẶNG TỪ MAI - BEVITA\n" +
            "CHEMICAL PEEL RENEWAL 450K\n" +
            "(khi phát sinh bất kỳ đơn hàng nào từ nay đến 30/9)",
        color: "#bde0fe",
    },
    {
        id: 12, name: "Tặng miễn phí combo travel Kit Mceutic 2 sản phẩm trị giá 350k", weight: 120,
        condition: "CHÚC MỪNG BẠN ĐÃ NHẬN ĐƯỢC QUÀ TẶNG TỪ MAI - BEVITA\n" +
            "COMBO MCEUTIC TRỊ GIÁ 350K\n" +
            "(khi phát sinh bất kỳ đơn hàng nào từ nay đến 30/9)",
        color: "#ff99c8",
    },
];
// Tổng: 309+150+1+50+50+50+100+100+50+10+10+120 = 1000 ✓

export const ASSETS = {
    sounds: {
        spin: "https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3",
        fireworks: "https://assets.mixkit.co/active_storage/sfx/1993/1993-preview.mp3",
    },
};