import React, { useEffect, useRef } from 'react';
import { Prize } from '../types';

interface WheelProps {
  prizes: Prize[];
  isSpinning: boolean;
  onFinished: () => void;
  targetPrizeId: number | null;
  onSpinClick?: () => void;
  canSpin?: boolean;
}

const WHEEL_SIZE = 500;
const CENTER_RADIUS = 48;
const FREE_SPIN_VELOCITY = 0.022; // radian/frame ≈ 1.32 rad/s ở 60fps

const Wheel: React.FC<WheelProps> = ({
  prizes, isSpinning, onFinished, targetPrizeId, onSpinClick, canSpin,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const requestRef = useRef<number>();
  const freeSpinningRef = useRef(false);
  const deceleratingRef = useRef(false);
  const pendingTargetRef = useRef<number | null>(null);

  // Dùng ref để tránh stale closure trong animation loop
  const prizesRef = useRef(prizes);
  useEffect(() => { prizesRef.current = prizes; }, [prizes]);

  // Hàm vẽ bánh xe — nhận `disabled` để thay đổi nút QUAY
  const drawWheel = (rotation: number, disabled = false) => {
    const canvas = canvasRef.current;
    const pz = prizesRef.current;
    if (!canvas || pz.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = size / 2 - 22;
    const sliceAngle = (2 * Math.PI) / pz.length;

    ctx.clearRect(0, 0, size, size);

    pz.forEach((prize, i) => {
      const startAngle = i * sliceAngle + rotation;
      const endAngle = startAngle + sliceAngle;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#1a1a1a';
      const words = prize.name.split(' ');
      const lines: string[] = [];
      let current = '';
      const maxChars = pz.length > 12 ? 12 : 15;
      words.forEach(word => {
        if ((current + word).length > maxChars && current !== '') {
          lines.push(current.trim()); current = word + ' ';
        } else { current += word + ' '; }
      });
      lines.push(current.trim());
      const fontSize = pz.length > 12 ? 10 : 12;
      ctx.font = `bold ${fontSize}px "Be Vietnam Pro", sans-serif`;
      const lh = fontSize + 3;
      const th = lines.length * lh;
      lines.forEach((line, idx) => ctx.fillText(line, radius - 12, idx * lh - th / 2 + lh / 2));
      ctx.restore();
    });

    // Viền ngoài
    ctx.beginPath();
    ctx.arc(center, center, radius + 4, 0, 2 * Math.PI);
    ctx.strokeStyle = '#d94343'; ctx.lineWidth = 10; ctx.stroke();
    const dotCount = pz.length * 2;
    for (let j = 0; j < dotCount; j++) {
      ctx.save(); ctx.translate(center, center);
      ctx.rotate((j * (2 * Math.PI)) / dotCount + rotation);
      ctx.beginPath(); ctx.arc(radius + 4, 0, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
    }

    // Nút QUAY ở giữa — đổi màu khi disabled
    ctx.beginPath();
    ctx.arc(center, center, CENTER_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = disabled ? '#f0f0f0' : '#ffffff';
    ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = disabled ? '#cccccc' : '#d94343';
    ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = disabled ? '#aaaaaa' : '#d94343';
    ctx.font = '900 15px "Be Vietnam Pro"';
    ctx.textAlign = 'center';
    ctx.fillText('QUAY', center, center + 5);
  };

  const stopAnimation = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    freeSpinningRef.current = false;
    deceleratingRef.current = false;
  };

  const startDeceleration = (targetId: number) => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    freeSpinningRef.current = false;
    deceleratingRef.current = true;

    const pz = prizesRef.current;
    const prizeIndex = pz.findIndex(p => p.id === targetId);
    if (prizeIndex < 0) { deceleratingRef.current = false; onFinished(); return; }

    const sliceAngle = (2 * Math.PI) / pz.length;
    const currentRot = rotationRef.current;
    const targetAngle = -(prizeIndex + 0.5) * sliceAngle;
    let delta = ((targetAngle - currentRot) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    if (delta < Math.PI / 3) delta += 2 * Math.PI;
    const totalDelta = 2 * Math.PI * 2 + delta; // thêm 2 vòng rồi dừng vào ô đúng

    const startRot = currentRot;
    const startTime = performance.now();
    const duration = 2500; // 2.5 giây giảm tốc

    const animate = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out
      rotationRef.current = startRot + totalDelta * ease;
      drawWheel(rotationRef.current, false);
      if (t < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        deceleratingRef.current = false;
        pendingTargetRef.current = null;
        onFinished();
      }
    };
    requestRef.current = requestAnimationFrame(animate);
  };

  const startFreeSpin = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    freeSpinningRef.current = true;

    const animate = () => {
      if (!freeSpinningRef.current) return;
      rotationRef.current += FREE_SPIN_VELOCITY;
      drawWheel(rotationRef.current, false);

      // Khi API trả về kết quả → bắt đầu giảm tốc
      const target = pendingTargetRef.current;
      if (target !== null) {
        startDeceleration(target);
        return;
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
  };

  // Bắt đầu quay ngay khi isSpinning = true
  useEffect(() => {
    if (isSpinning) {
      pendingTargetRef.current = null;
      startFreeSpin();
    } else {
      stopAnimation();
      drawWheel(rotationRef.current, !canSpin);
    }
  }, [isSpinning]);

  // Khi API trả về targetPrizeId → đưa vào pendingTarget
  useEffect(() => {
    if (targetPrizeId !== null) {
      pendingTargetRef.current = targetPrizeId;
      // Nếu API trả về trước khi free spin kịp start
      if (!freeSpinningRef.current && !deceleratingRef.current && isSpinning) {
        startDeceleration(targetPrizeId);
      }
    }
  }, [targetPrizeId]);

  // Cập nhật trạng thái nút khi canSpin thay đổi
  useEffect(() => {
    if (!isSpinning) drawWheel(rotationRef.current, !canSpin);
  }, [canSpin]);

  useEffect(() => {
    const t = setTimeout(() => drawWheel(rotationRef.current, !canSpin), 100);
    return () => { clearTimeout(t); stopAnimation(); };
  }, [prizes]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSpinClick || !canSpin || isSpinning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const sy = (e.clientY - rect.top) * (canvas.height / rect.height);
    if (Math.hypot(sx - canvas.width / 2, sy - canvas.height / 2) <= CENTER_RADIUS) {
      onSpinClick();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const sy = (e.clientY - rect.top) * (canvas.height / rect.height);
    const inCenter = Math.hypot(sx - canvas.width / 2, sy - canvas.height / 2) <= CENTER_RADIUS;
    canvas.style.cursor = inCenter
      ? (canSpin && !isSpinning ? 'pointer' : 'not-allowed')
      : 'default';
  };

  return (
    <div className="relative inline-block select-none">
      <canvas
        ref={canvasRef}
        width={WHEEL_SIZE}
        height={WHEEL_SIZE}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        className="max-w-full h-auto drop-shadow-2xl"
        style={{ opacity: canSpin || isSpinning ? 1 : 0.65 }}
      />
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 ${isSpinning ? 'animate-bounce' : ''}`}
        style={{ width: 40, height: 28 }}
      >
        <div
          className="w-full h-full shadow-lg border-2 border-white"
          style={{
            background: canSpin || isSpinning ? '#d94343' : '#cccccc',
            clipPath: 'polygon(0 50%, 100% 0, 100% 100%)',
          }}
        />
      </div>
    </div>
  );
};

export default Wheel;
