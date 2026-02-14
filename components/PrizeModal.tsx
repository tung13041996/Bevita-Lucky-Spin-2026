
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
    const timer = setTimeout(onClose, 8000);
    return () => clearTimeout(timer);
  }, [prize, onClose]);

  if (!prize) return null;

  // Extract clean prize name without the quantity suffix
  const cleanPrizeName = prize.prizeName.split(' — ')[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl text-center overflow-hidden border-8 border-[#d94343]">
        {/* Fireworks Decoration Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <div className="w-full h-full animate-pulse bg-[radial-gradient(circle,_#d94343_1px,_transparent_1px)] bg-[size:30px_30px]"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[300px]">
          <div className="mb-8">
            <span className="text-8xl">🎊</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-gray-800 leading-tight mb-10">
            Chúc mừng <span className="text-[#d94343]">{userName}</span> <br/>
            đã nhận được <br/>
            <span className="text-[#008A92] mt-6 block text-4xl md:text-6xl uppercase tracking-tight">{cleanPrizeName}</span>
          </h2>

          <button
            onClick={onClose}
            className="bg-[#d94343] text-white px-14 py-5 rounded-2xl font-black text-2xl hover:bg-[#b83232] transition-all shadow-lg active:scale-95"
          >
            TIẾP TỤC
          </button>
          
          <p className="mt-8 text-sm text-gray-400 italic">
            Cửa sổ tự động đóng sau vài giây
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-6 left-6 text-5xl opacity-60">🌸</div>
        <div className="absolute top-6 right-6 text-5xl opacity-60">🌸</div>
        <div className="absolute bottom-6 left-6 text-5xl opacity-60">🧧</div>
        <div className="absolute bottom-6 right-6 text-5xl opacity-60">🧧</div>
      </div>
    </div>
  );
};

export default PrizeModal;
