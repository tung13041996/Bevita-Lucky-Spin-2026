import { Prize } from './types';

export const INITIAL_PRIZES: Prize[] = [
  {
    id: 1,
    name: "Voucher 10%",
    weight: 30,
    condition: "Áp dụng cho tất cả các đơn hàng",
    color: "#F4845F",
  },
  {
    id: 2,
    name: "Voucher 15%",
    weight: 15,
    condition: "Áp dụng cho tất cả các đơn hàng",
    color: "#118AB2",
  },
  {
    id: 3,
    name: "Voucher 20%",
    weight: 1,
    condition: "Áp dụng cho tất cả các đơn hàng",
    color: "#E63946",
  },
  {
    id: 4,
    name: "Voucher 300K",
    weight: 5,
    condition: "Áp dụng đơn hàng từ 2 triệu",
    color: "#FFBF69",
  },
  {
    id: 5,
    name: "Voucher 500K",
    weight: 5,
    condition: "Áp dụng đơn hàng từ 4 triệu",
    color: "#9B5DE5",
  },
  {
    id: 6,
    name: "Voucher 800K",
    weight: 5,
    condition: "Áp dụng cho đơn hàng từ 6 triệu",
    color: "#C77DFF",
  },
  {
    id: 7,
    name: "Voucher DV 500K",
    weight: 10,
    condition: "Dùng cho tất cả dịch vụ tại Bevita",
    color: "#FEE440",
  },
  {
    id: 8,
    name: "Voucher DV 800K",
    weight: 10,
    condition: "Dùng cho tất cả dịch vụ tại Bevita",
    color: "#00BBF9",
  },
  {
    id: 9,
    name: "Tặng bông tẩy trang 113k",
    weight: 5,
    condition: "Áp dụng khi phát sinh bất kỳ đơn hàng đi kèm, đến hết 30/9",
    color: "#C8F7C5",
  },
  {
    id: 10,
    name: "Tặng túi mỹ phẩm Bevita 200k",
    weight: 1,
    condition: "Áp dụng khi phát sinh bất kỳ đơn hàng đi kèm, đến hết 30/9",
    color: "#FFDDD2",
  },
  {
    id: 11,
    name: "Tặng SP peel 450k",
    weight: 1,
    condition: "Áp dụng khi phát sinh bất kỳ đơn hàng đi kèm, đến hết 30/9",
    color: "#BDE0FE",
  },
  {
    id: 12,
    name: "Tặng combo Travel Kit Mceutic",
    weight: 12,
    condition: "Áp dụng khi phát sinh bất kỳ đơn hàng đi kèm, đến hết 30/09",
    color: "#FF99C8",
  },
];

export const ASSETS = {
  sounds: {
    spin: "https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3",
    fireworks: "https://assets.mixkit.co/active_storage/sfx/1993/1993-preview.mp3",
  },
};
