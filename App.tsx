import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, SpinResult, Prize, ClaimRecord } from './types';
import { ASSETS, INITIAL_PRIZES } from './constants';
import { api } from './services/api';
import Wheel from './components/Wheel';
import PrizeModal from './components/PrizeModal';
import { User, Phone, Gift, ArrowRight, Loader2, Camera } from 'lucide-react';

const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

function pickWeighted(pool: Prize[]): Prize {
  const total = pool.reduce((a, p) => a + p.weight, 0);
  let r = Math.random() * total;
  for (const p of pool) { r -= p.weight; if (r < 0) return p; }
  return pool[pool.length - 1];
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    name: '', phone: '', phoneError: null,
    spins: [], selectedPrizeIds: [],
    isClaimed: false, isSpinning: false,
    error: null, showModal: false,
    lastSpunPrize: null, showFinalPopup: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prizes, setPrizes] = useState<Prize[]>(INITIAL_PRIZES);
  const spinAudio = useRef<HTMLAudioElement | null>(null);
  const winAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const p = await api.getPrizes();
        if (p?.length > 0) setPrizes(p);
      } catch { /* fallback */ }
    })();
    spinAudio.current = new Audio(ASSETS.sounds.spin);
    winAudio.current = new Audio(ASSETS.sounds.fireworks);
  }, []);

  // Kiểm tra SĐT sau khi quay xong 3 lần
  useEffect(() => {
    const allDone = state.spins.length >= 3;
    if (!allDone || !phoneRegex.test(state.phone)) {
      setState(prev => ({ ...prev, phoneError: null }));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const existing = await api.getParticipant(state.phone);
        if (cancelled) return;
        setState(prev => ({
          ...prev,
          phoneError: existing?.isClaimed ? 'Số điện thoại này đã nhận thưởng rồi' : null,
        }));
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [state.phone, state.spins.length]);

  // Spin hoàn toàn client-side — không cần gọi API
  const handleSpin = () => {
    if (state.spins.length >= 3 || state.isSpinning || state.isClaimed) return;
    const usedIds = new Set(state.spins.map(s => s.prizeId));
    const pool = prizes.filter(p => !usedIds.has(p.id));
    const chosen = pickWeighted(pool);
    const result: SpinResult = { prizeId: chosen.id, prizeName: chosen.name, condition: chosen.condition };
    setState(prev => ({ ...prev, isSpinning: true, lastSpunPrize: result }));
    spinAudio.current?.play().catch(() => {});
  };

  const onWheelFinished = useCallback(() => {
    setState(prev => ({
      ...prev,
      isSpinning: false,
      showModal: true,
      spins: [...prev.spins, prev.lastSpunPrize!],
    }));
    spinAudio.current?.pause();
    if (spinAudio.current) spinAudio.current.currentTime = 0;
    winAudio.current?.play().catch(() => {});
  }, []);

  const togglePrize = (prizeId: number) => {
    setState(prev => {
      const ids = prev.selectedPrizeIds;
      return { ...prev, selectedPrizeIds: ids.includes(prizeId) ? ids.filter(id => id !== prizeId) : [...ids, prizeId] };
    });
  };

  const handleClaim = async () => {
    if (isSubmitting || !isClaimable) return;
    setIsSubmitting(true);
    const record: ClaimRecord = {
      name: state.name, phone: state.phone,
      spunPrizeIds: state.spins.map(s => s.prizeId),
      selectedPrizeIds: state.selectedPrizeIds,
      timestamp: new Date().toISOString(),
    };
    try {
      await api.claim(record);
      setState(prev => ({ ...prev, isClaimed: true, showFinalPopup: true }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const allSpinsDone = state.spins.length >= 3;
  const spinsLeft = 3 - state.spins.length;
  const canSpin = !allSpinsDone && !state.isSpinning && !state.isClaimed;
  const phoneValid = phoneRegex.test(state.phone);
  const nameValid = state.name.trim() !== '';
  const formValid = nameValid && phoneValid && !state.phoneError;
  const isClaimable = allSpinsDone && formValid && state.selectedPrizeIds.length > 0 && !state.isClaimed;
  const selectedPrizes = state.spins.filter(s => state.selectedPrizeIds.includes(s.prizeId));

  return (
    <div className="min-h-screen overflow-x-hidden relative bg-[#f0f7f4] flex flex-col items-center py-6 px-4">
      <div className="fixed top-4 left-4 opacity-30 text-4xl pointer-events-none">🌸</div>
      <div className="fixed top-10 right-10 opacity-30 text-4xl pointer-events-none">🌸</div>
      <div className="fixed bottom-10 left-6 opacity-30 text-4xl pointer-events-none">🧧</div>
      <div className="fixed bottom-10 right-6 opacity-30 text-4xl pointer-events-none">🧧</div>

      <header className="max-w-5xl w-full text-center mb-8 px-4">
        <div className="inline-block bg-[#d94343] text-white text-xs font-black px-4 py-1 rounded-full mb-3 uppercase tracking-widest">
          🇻🇳 Chào mừng Đại lễ 2/9
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#d94343] mb-2 uppercase leading-tight drop-shadow-sm">
          Vòng Quay Chào Mừng Đại Lễ
        </h1>
        <h2 className="text-sm md:text-base font-bold text-[#008A92] mb-4 uppercase tracking-wide">
          Mai NTP &amp; Bevita — 100% Trúng Quà 🎁
        </h2>
        <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-teal-100 shadow-sm inline-block max-w-xl">
          <p className="text-gray-600 text-sm">
            Quay 3 lần → Chọn phần quà → Nhập thông tin → Chụp màn hình gửi về Mai/Bevita
          </p>
        </div>
      </header>

      <main className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start">

        {/* LEFT PANEL */}
        <section className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-teal-50">

          {!allSpinsDone ? (
            /* === TRƯỚC KHI QUAY XONG === */
            <div>
              {state.spins.length === 0 ? (
                /* Chưa quay lần nào */
                <div className="text-center py-4">
                  <div className="text-5xl mb-4">🎡</div>
                  <h3 className="text-lg font-black text-[#d94343] mb-2 uppercase">Bắt đầu quay nào!</h3>
                  <p className="text-gray-500 text-sm mb-4">Bạn có <strong className="text-[#d94343]">3 lượt quay</strong> để nhận quà.</p>
                  <p className="text-gray-400 text-xs">Nhấn vào nút <strong>QUAY</strong> ở giữa bánh xe bên phải →</p>
                </div>
              ) : (
                /* Đã quay 1-2 lần */
                <div>
                  <h3 className="text-sm font-black text-[#008A92] border-b-2 pb-3 mb-5 border-teal-50 uppercase tracking-wider">
                    Kết quả đã quay
                  </h3>
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mb-5">
                    {[1,2,3].map(n => (
                      <div key={n} className={`flex-1 h-2 rounded-full transition-all ${n <= state.spins.length ? 'bg-[#d94343]' : 'bg-gray-100'}`} />
                    ))}
                    <span className="text-xs font-bold text-[#d94343] ml-1 whitespace-nowrap">
                      {spinsLeft} lượt còn lại
                    </span>
                  </div>
                  {/* Prizes won so far */}
                  <div className="space-y-2 mb-5">
                    {state.spins.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="w-6 h-6 rounded-full bg-[#d94343] text-white text-xs font-black flex items-center justify-center shrink-0">{i+1}</span>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{s.prizeName}</p>
                          {s.condition && <p className="text-xs text-gray-400 mt-0.5">{s.condition}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center p-3 bg-teal-50 rounded-xl">
                    <p className="text-sm text-[#008A92] font-bold animate-pulse">
                      Còn {spinsLeft} lượt → nhấn QUAY tiếp! →
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* === SAU KHI QUAY XONG 3 LẦN === */
            <div>
              {/* Chọn phần quà */}
              <h3 className="text-sm font-black text-[#008A92] border-b-2 pb-3 mb-5 border-teal-50 uppercase tracking-wider flex items-center gap-2">
                <Gift size={16} className="text-[#d94343]" />
                {state.isClaimed ? 'Phần quà đã chọn:' : 'Chọn phần quà muốn nhận:'}
              </h3>
              <div className="space-y-2 mb-6">
                {state.spins.map((prize) => {
                  const isSelected = state.selectedPrizeIds.includes(prize.prizeId);
                  return (
                    <label key={prize.prizeId} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-[#d94343] bg-red-50' : 'border-gray-100 bg-gray-50'} ${state.isClaimed ? 'cursor-default' : ''}`}>
                      <input type="checkbox" checked={isSelected}
                        onChange={() => !state.isClaimed && togglePrize(prize.prizeId)}
                        disabled={state.isClaimed || isSubmitting}
                        className="mt-0.5 w-4 h-4 accent-[#d94343] shrink-0"
                      />
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{prize.prizeName}</p>
                        {prize.condition && <p className="text-xs text-gray-400 mt-0.5">{prize.condition}</p>}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Form thông tin — chỉ hiện sau khi quay xong */}
              {!state.isClaimed && (
                <div className="border-t-2 border-teal-50 pt-5">
                  <h3 className="text-sm font-black text-[#008A92] mb-4 uppercase tracking-wider">
                    Thông tin của bạn
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase mb-2">
                        <User size={14} className="text-[#d94343]" /> Họ và tên
                      </label>
                      <input type="text" placeholder="Nhập họ và tên đầy đủ"
                        value={state.name}
                        onChange={e => setState(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#00B2BD] outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase mb-2">
                        <Phone size={14} className="text-[#d94343]" /> Số điện thoại
                      </label>
                      <input type="tel" placeholder="Nhập số điện thoại"
                        value={state.phone}
                        onChange={e => setState(p => ({ ...p, phone: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-sm ${state.phoneError ? 'border-red-300 bg-red-50' : 'border-gray-100 focus:border-[#00B2BD]'}`}
                      />
                      {state.phoneError && (
                        <p className="text-red-500 text-xs font-semibold mt-1">{state.phoneError}</p>
                      )}
                      <p className="text-[#008A92] text-xs font-semibold mt-2 italic">* Mỗi SĐT chỉ nhận thưởng 1 lần</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {state.error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">
                  {state.error}
                </div>
              )}

              {/* CTA */}
              <div className="mt-5">
                {!state.isClaimed && (
                  <button onClick={handleClaim} disabled={!isClaimable || isSubmitting}
                    className="w-full py-4 rounded-xl font-black text-base bg-[#d94343] hover:bg-[#b83232] text-white shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 transition-all"
                  >
                    {isSubmitting
                      ? <><Loader2 className="animate-spin" size={18} />ĐANG XỬ LÝ...</>
                      : <>XÁC NHẬN NHẬN QUÀ <ArrowRight size={18} /></>
                    }
                  </button>
                )}
                {state.isClaimed && (
                  <div className="space-y-3">
                    <div className="p-4 bg-teal-50 text-teal-800 rounded-xl border-2 border-teal-100 text-center font-bold text-sm">
                      ✅ Đã ghi nhận thành công!
                    </div>
                    <button onClick={() => setState(p => ({ ...p, showFinalPopup: true }))}
                      className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm">
                      Xem lại xác nhận
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* RIGHT: WHEEL */}
        <section className="flex flex-col items-center justify-center p-6 bg-white/40 rounded-[2.5rem] backdrop-blur-md border border-white/60 min-h-[420px]">
          <div className="relative transform scale-[0.7] md:scale-[0.85] lg:scale-100 origin-center">
            <Wheel
              prizes={prizes}
              isSpinning={state.isSpinning}
              onFinished={onWheelFinished}
              targetPrizeId={state.lastSpunPrize?.prizeId ?? null}
              onSpinClick={handleSpin}
              canSpin={canSpin}
            />
          </div>
          <div className="mt-4 text-center text-sm font-bold">
            {state.spins.length === 0 && <p className="text-[#008A92] animate-pulse">Nhấn vào nút QUAY ở giữa bánh xe!</p>}
            {canSpin && state.spins.length > 0 && <p className="text-[#008A92] animate-pulse">Còn {spinsLeft} lượt — nhấn QUAY tiếp!</p>}
            {allSpinsDone && !state.isClaimed && <p className="text-[#d94343]">Đã quay xong! Chọn quà và điền thông tin bên trái 👈</p>}
            {state.isClaimed && <p className="text-teal-600">🎉 Cảm ơn bạn đã tham gia!</p>}
          </div>
        </section>
      </main>

      {/* Prize modal sau mỗi lần quay */}
      <PrizeModal
        prize={state.showModal ? state.lastSpunPrize : null}
        userName="bạn"
        onClose={() => setState(p => ({ ...p, showModal: false }))}
      />

      {/* Final popup */}
      {state.showFinalPopup && selectedPrizes.length > 0 && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-teal-900/80 backdrop-blur-xl">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl text-center border-8 border-red-50">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-3xl font-black text-[#d94343] mb-1 uppercase">Xác nhận!</h3>
            <p className="text-gray-400 text-sm mb-6">Bevita đã ghi nhận phần quà của bạn</p>
            <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left space-y-2 border border-gray-100">
              <p className="text-sm font-bold text-gray-600">Họ tên: <span className="text-gray-900 uppercase">{state.name}</span></p>
              <p className="text-sm font-bold text-gray-600">SĐT: <span className="text-gray-900">{state.phone}</span></p>
              <div className="mt-3 space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase">Phần quà đã chọn</p>
                {selectedPrizes.map(prize => (
                  <div key={prize.prizeId} className="bg-[#d94343] p-3 rounded-xl text-white">
                    <p className="font-black text-lg">{prize.prizeName}</p>
                    {prize.condition && <p className="text-xs opacity-80 mt-0.5">{prize.condition}</p>}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Camera size={20} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 font-medium text-left">
                Chụp màn hình này và gửi lại qua tin nhắn cho Mai / Bevita để được xác nhận nhận quà.
              </p>
            </div>
            <button onClick={() => setState(p => ({ ...p, showFinalPopup: false }))}
              className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
