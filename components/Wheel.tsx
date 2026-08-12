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

const Wheel: React.FC<WheelProps> = ({
  prizes,
  isSpinning,
  onFinished,
  targetPrizeId,
  onSpinClick,
  canSpin,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const requestRef = useRef<number | undefined>(undefined);

  const WHEEL_SIZE = 500;
  const CENTER_RADIUS = 48;

  const drawWheel = (rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas || prizes.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = size / 2 - 22;
    const sliceAngle = (2 * Math.PI) / prizes.length;

    ctx.clearRect(0, 0, size, size);

    // Draw slices
    prizes.forEach((prize, i) => {
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

      // Text label
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#1a1a1a';

      // Split long name into 2 lines max
      const fullText = prize.name;
      const words = fullText.split(' ');
      const lines: string[] = [];
      let current = '';
      const maxChars = prizes.length > 12 ? 12 : 15;

      words.forEach(word => {
        if ((current + word).length > maxChars && current !== '') {
          lines.push(current.trim());
          current = word + ' ';
        } else {
          current += word + ' ';
        }
      });
      lines.push(current.trim());

      const fontSize = prizes.length > 12 ? 10 : 12;
      ctx.font = `bold ${fontSize}px "Be Vietnam Pro", sans-serif`;
      const lineHeight = fontSize + 3;
      const totalHeight = lines.length * lineHeight;

      lines.forEach((line, idx) => {
        const yOffset = idx * lineHeight - totalHeight / 2 + lineHeight / 2;
        ctx.fillText(line, radius - 12, yOffset);
      });

      ctx.restore();
    });

    // Outer ring
    ctx.beginPath();
    ctx.arc(center, center, radius + 4, 0, 2 * Math.PI);
    ctx.strokeStyle = '#d94343';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Decorative dots on ring
    const dotCount = prizes.length * 2;
    for (let j = 0; j < dotCount; j++) {
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate((j * (2 * Math.PI)) / dotCount + rotation);
      ctx.beginPath();
      ctx.arc(radius + 4, 0, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.restore();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, CENTER_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#d94343';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.fillStyle = '#d94343';
    ctx.font = '900 15px "Be Vietnam Pro"';
    ctx.textAlign = 'center';
    ctx.fillText('QUAY', center, center + 5);
  };

  const startSpinAnimation = (targetId: number) => {
    const prizeIndex = prizes.findIndex(p => p.id === targetId);
    if (prizeIndex < 0) return;

    const sliceAngle = (2 * Math.PI) / prizes.length;
    const targetAngle = -(prizeIndex + 0.5) * sliceAngle;
    const startRotation = rotationRef.current;
    const minRounds = 10;
    const finalRotation =
      startRotation +
      Math.PI * 2 * minRounds +
      ((targetAngle - (startRotation % (Math.PI * 2)) + Math.PI * 4) % (Math.PI * 2));

    const startTime = performance.now();
    const duration = 5000;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 5);
      rotationRef.current = startRotation + (finalRotation - startRotation) * ease;
      drawWheel(rotationRef.current);
      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        onFinished();
      }
    };
    requestRef.current = requestAnimationFrame(animate);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSpinClick || !canSpin || isSpinning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const sx = (e.clientX - rect.left) * scaleX;
    const sy = (e.clientY - rect.top) * scaleY;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    if (Math.hypot(sx - cx, sy - cy) <= CENTER_RADIUS) {
      onSpinClick();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const sx = (e.clientX - rect.left) * scaleX;
    const sy = (e.clientY - rect.top) * scaleY;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    canvas.style.cursor =
      Math.hypot(sx - cx, sy - cy) <= CENTER_RADIUS && canSpin && !isSpinning
        ? 'pointer'
        : 'default';
  };

  useEffect(() => {
    if (isSpinning && targetPrizeId !== null) {
      startSpinAnimation(targetPrizeId);
    }
  }, [isSpinning, targetPrizeId]);

  useEffect(() => {
    const timer = setTimeout(() => drawWheel(rotationRef.current), 100);
    return () => {
      clearTimeout(timer);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [prizes]);

  return (
    <div className="relative inline-block select-none">
      <canvas
        ref={canvasRef}
        width={WHEEL_SIZE}
        height={WHEEL_SIZE}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        className="max-w-full h-auto drop-shadow-2xl transition-opacity duration-300"
        style={{ opacity: canSpin || isSpinning ? 1 : 0.75 }}
      />
      {/* Pointer arrow on the right */}
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 ${isSpinning ? 'animate-bounce' : ''}`}
        style={{ width: 40, height: 28 }}
      >
        <div
          className="w-full h-full bg-red-600 shadow-lg border-2 border-white"
          style={{ clipPath: 'polygon(0 50%, 100% 0, 100% 100%)' }}
        />
      </div>
    </div>
  );
};

export default Wheel;
