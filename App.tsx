
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, SpinResult, Prize, ClaimRecord } from './types';
import { ASSETS, INITIAL_PRIZES, FACEBOOK_POST_URL } from './constants';
import { api } from './services/api';
import Wheel from './components/Wheel';
import PrizeModal from './components/PrizeModal';
import { User, Phone, Gift, ArrowRight, ExternalLink, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    name: '',
    phone: '',
    spins: [],
    selectedPrizeIndex: null,
    isClaimed: false,
    isSpinning: false,
    error: null,
    showModal: false,
    lastSpunPrize: null,
    showFinalPopup: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prizes, setPrizes] = useState<Prize[]>(INITIAL_PRIZES);
  const spinAudio = useRef<HTMLAudioElement | null>(null);
  const winAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const serverPrizes = await api.getPrizes();
        setPrizes(serverPrizes);
      } catch (e: any) {
        setState(prev => ({ ...prev, error: e?.message || "Không tải được danh sách quà" }));
      }
    })();
    spinAudio.current = new Audio(ASSETS.sounds.spin);
    winAudio.current = new Audio(ASSETS.sounds.fireworks);
  }, []);

  // Effect to check and restore state when phone changes
  useEffect(() => {
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(state.phone)) return;

    let cancelled = false;
    (async () => {
      try {
        const existing = await api.getParticipant(state.phone);
        if (!existing || cancelled) return;

        const selectedIndex = existing.selectedPrizeId
          ? existing.spins.findIndex(s => s.prizeId === existing.selectedPrizeId)
          : null;

        setState(prev => ({
          ...prev,
          name: existing.name || prev.name,
          spins: existing.spins,
          isClaimed: existing.isClaimed,
          selectedPrizeIndex: existing.isClaimed ? (selectedIndex >= 0 ? selectedIndex : prev.selectedPrizeIndex) : prev.selectedPrizeIndex,
          error: existing.isClaimed ? "Số điện thoại này đã nhận thưởng" : null
        }));
      } catch (e: any) {
        if (!cancelled) setState(prev => ({ ...prev, error: e?.message || "Lỗi kiểm tra SĐT" }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.phone]);

  const handleSpin = async () => {
    if (!state.name || !state.phone) return;
    setState(prev => ({ ...prev, error: null }));

    try {
      const result = await api.spin(state.name, state.phone);
      setState(prev => ({ ...prev, isSpinning: true, lastSpunPrize: result }));
      spinAudio.current?.play();

      // refresh shared inventory right after spin (reserved)
      setPrizes(await api.getPrizes());
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err?.message || 'Lỗi quay' }));
    }
  };

  const onWheelFinished = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isSpinning: false, 
      showModal: true,
      spins: [...prev.spins, prev.lastSpunPrize!]
    }));
    spinAudio.current?.pause();
    if (spinAudio.current) spinAudio.current.currentTime = 0;
    winAudio.current?.play();
  }, []);

  const handleClaim = async () => {
    if (state.selectedPrizeIndex === null || isSubmitting) return;
    
    setIsSubmitting(true);
    const selectedPrize = state.spins[state.selectedPrizeIndex];
    const record: ClaimRecord = {
      name: state.name,
      phone: state.phone,
      selectedPrizeId: selectedPrize.prizeId,
      spin1PrizeId: state.spins[0].prizeId,
      spin2PrizeId: state.spins[1]?.prizeId || null,
      spin3PrizeId: state.spins[2]?.prizeId || null,
      timestamp: new Date().toISOString()
    };

    try {
      await api.claim(record);
      setState(prev => ({ ...prev, isClaimed: true, showFinalPopup: true }));
      setPrizes(await api.getPrizes());
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = state.name.trim() !== '' && state.phone.trim() !== '';
  const canSpin = isFormValid && state.spins.length < 3 && !state.isSpinning && !state.isClaimed;
  const isLocked = state.spins.length > 0 || state.isClaimed;

  return (
    <div className="min-h-screen lg:h-screen overflow-x-hidden relative bg-[#f0f7f4] flex flex-col items-center py-4 px-4">
      <div className="blossom-decoration top-0 left-0 p-4 opacity-40 text-4xl">🌸</div>
      <div className="blossom-decoration top-10 right-10 p-4 opacity-40 text-4xl">🌸</div>
      <div className="blossom-decoration bottom-10 right-5 p-4 opacity-40 text-4xl">🌸</div>

      <header className="max-w-6xl w-full flex flex-col items-center mb-6 text-center px-4">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-[#d94343] mb-3 uppercase drop-shadow-sm tracking-tight leading-tight">
          🧧 TẾT RỰC RỠ - QUAY LÀ TRÚNG 🧧
        </h1>
        <h2 className="text-base md:text-xl font-bold text-[#008A92] mb-3 uppercase">
          🌸 Khai xuân rộn ràng – Nhận lộc ngập tràn cùng BEVITA
        </h2>
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-teal-100 shadow-sm max-w-3xl">
          <p className="text-gray-700 text-sm md:text-base">
            Chào đón 2026 rực rỡ! <strong>100% CÓ QUÀ</strong> khi tham gia vòng quay may mắn! 🎁
          </p>
        </div>
      </header>

      <main className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-8 items-start flex-1">
        <section className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-teal-50">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#008A92] border-b-2 pb-2 border-teal-50 uppercase">Thông tin cá nhân</h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase mb-2">
                  <User size={16} className="text-[#d94343]" /> Tên khách hàng
                </label>
                <input 
                  type="text"
                  placeholder="Nhập họ và tên"
                  value={state.name}
                  onChange={e => setState(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 focus:border-[#00B2BD] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                  disabled={isLocked}
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase mb-2">
                  <Phone size={16} className="text-[#d94343]" /> Số điện thoại
                </label>
                <input 
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={state.phone}
                  onChange={e => setState(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 focus:border-[#00B2BD] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                  disabled={state.isClaimed}
                />
                <p className="text-[#008A92] text-xs font-bold mt-2 italic">* Mỗi SĐT được tối đa 3 lần quay</p>
              </div>
            </div>

            {state.error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">{state.error}</div>}

            {state.spins.length > 0 && (
              <div className="mt-6 pt-6 border-t-2 border-teal-50">
                <h3 className="font-bold text-[#008A92] mb-4 flex items-center gap-2 text-sm uppercase">
                  <Gift size={18} className="text-[#d94343]" /> {state.isClaimed ? "Phần quà đã nhận:" : "Chọn quà bạn muốn nhận:"}
                </h3>
                <div className="space-y-3">
                  {state.spins.map((prize, idx) => (
                    <label 
                      key={idx} 
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${state.selectedPrizeIndex === idx ? 'border-[#d94343] bg-red-50' : 'border-gray-100 bg-gray-50'}`}
                    >
                      <input 
                        type="radio" 
                        name="prize" 
                        checked={state.selectedPrizeIndex === idx}
                        onChange={() => setState(p => ({ ...p, selectedPrizeIndex: idx }))}
                        disabled={state.isClaimed || isSubmitting}
                        className="w-5 h-5 accent-[#d94343]"
                      />
                      <span className="font-bold text-gray-800 text-sm">{prize.prizeName.split(' — ')[0]}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8">
            {state.spins.length > 0 && !state.isClaimed && (
              <button
                onClick={handleClaim}
                disabled={state.selectedPrizeIndex === null || isSubmitting}
                className="w-full py-4 rounded-xl font-black text-lg bg-[#d94343] hover:bg-[#b83232] text-white shadow-lg flex items-center justify-center gap-3 disabled:bg-gray-200"
              >
                {isSubmitting ? <><Loader2 className="animate-spin" /> ĐANG XỬ LÝ...</> : <>NHẬN QUÀ <ArrowRight size={22} /></>}
              </button>
            )}
            {state.isClaimed && (
              <div className="space-y-4">
                <div className="p-4 bg-teal-50 text-teal-800 rounded-xl border-2 border-teal-100 text-center font-bold">
                  Đã ghi nhận phần quà! 🎉
                </div>
                <button 
                  onClick={() => setState(p => ({ ...p, showFinalPopup: true }))}
                  className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  XEM LẠI XÁC NHẬN
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col items-center justify-center p-4 bg-white/30 rounded-[3rem] backdrop-blur-md border border-white/60">
          <div className="relative transform scale-[0.7] md:scale-90 lg:scale-100 origin-center">
            <Wheel 
              prizes={prizes} 
              isSpinning={state.isSpinning} 
              onFinished={onWheelFinished}
              targetPrizeId={state.lastSpunPrize?.prizeId || null}
              onSpinClick={handleSpin}
              canSpin={canSpin}
            />
          </div>
        </section>
      </main>

      <PrizeModal 
        prize={state.showModal ? state.lastSpunPrize : null} 
        userName={state.name}
        onClose={() => setState(p => ({ ...p, showModal: false }))} 
      />

      {state.showFinalPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-teal-900/80 backdrop-blur-xl">
          <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl text-center border-[12px] border-red-50">
             <h3 className="text-4xl font-black text-red-600 mb-2 uppercase">XÁC NHẬN!</h3>
             <p className="text-gray-500 mb-8">Bevita đã ghi nhận phần quà của bạn</p>
             <div className="bg-red-50 p-8 rounded-[2rem] mb-8 border-4 border-dashed border-red-200">
               <div className="text-left bg-white p-6 rounded-2xl shadow-xl">
                 <p className="font-bold border-b pb-2">Họ tên: <span className="text-red-600 uppercase">{state.name}</span></p>
                 <p className="font-bold border-b py-2">SĐT: <span className="text-red-600">{state.phone}</span></p>
                 <div className="bg-[#d94343] mt-4 p-4 rounded-xl text-white text-center">
                   <p className="text-xs opacity-80 uppercase mb-1">Quà tặng</p>
                   <p className="font-black text-xl">
                    {state.selectedPrizeIndex !== null ? state.spins[state.selectedPrizeIndex]?.prizeName.split(' — ')[0] : "Chưa chọn quà"}
                   </p>
                 </div>
               </div>
             </div>
             <div className="space-y-4">
               <p className="text-sm text-yellow-900 font-bold bg-yellow-100 p-4 rounded-xl">
                 "Vui lòng chụp lại màn hình và gửi vào bài viết Facebook được gim ở đầu tiên để nhận thưởng!"
               </p>
               <a href={FACEBOOK_POST_URL} target="_blank" className="inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-[1.5rem] font-black w-full justify-center">
                 GỬI LÊN FACEBOOK <ExternalLink />
               </a>
               <button onClick={() => setState(p => ({ ...p, showFinalPopup: false }))} className="block w-full text-gray-400 font-bold py-2">ĐÓNG</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
