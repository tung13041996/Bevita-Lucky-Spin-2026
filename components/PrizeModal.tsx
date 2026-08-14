import React, { useEffect } from 'react';
import { SpinResult } from '../types';

interface PrizeModalProps {
  prize: SpinResult | null;
  userName: string;
  onClose: () => void;
}

const PrizeModal: React.FC<PrizeModalProps> = ({ prize, userName, onClose }) => {
  useEffect(() => {
    if (!prize) return;
    const timer = setTimeout(onClose, 10000);
    return () => clearTimeout(timer);
  }, [prize, onClose]);

  if (!prize) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-white rounded-[2.5rem] p-10 max-w-xl w-full shadow-2xl text-center overflow-hidden border-8 border-[#d94343]">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="w-full h-full animate-pulse bg-[radial-gradient(circle,_#d94343_1px,_transparent_1px)] bg-[size:28px_28px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="mb-6 text-7xl">🎊</div>

          <h2 className="text-2xl md:text-3xl font-black text-gray-800 leading-tight mb-4">
            Chúc mừng{' '}
            <span className="text-[#d94343]">{userName}</span>
            <br />đã trúng
          </h2>

          <div className="bg-[#d94343] text-white px-8 py-5 rounded-2xl mb-6 w-full">
            <p className="font-black text-3xl md:text-4xl uppercase tracking-tight">
              {prize.prizeName}
            </p>
          </div>

          {/* Hiện điều kiện nhưng bỏ nhãn "Điều kiện áp dụng" */}
          {prize.condition && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl px-6 py-3 mb-8 w-full">
              <p className="text-sm text-amber-900 font-medium">{prize.condition}</p>
            </div>
          )}

          <button
            onClick={onClose}
            className="bg-[#d94343] text-white px-12 py-4 rounded-2xl font-black text-xl hover:bg-[#b83232] transition-all shadow-lg active:scale-95"
          >
            TIẾP TỤC QUAY
          </button>

          <p className="mt-6 text-xs text-gray-400 italic">
            Cửa sổ tự động đóng sau vài giây
          </p>
        </div>

        <div className="absolute top-5 left-5 text-4xl opacity-50">🌸</div>
        <div className="absolute top-5 right-5 text-4xl opacity-50">🌸</div>
        <div className="absolute bottom-5 left-5 text-4xl opacity-50">🧧</div>
        <div className="absolute bottom-5 right-5 text-4xl opacity-50">🧧</div>
      </div>
    </div>
  );
};

export default PrizeModal;
