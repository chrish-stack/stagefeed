import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TipBurst {
  id: string;
  amount: number;
  x: number;
}

interface TipBarProps {
  onSendTip: (amount: number) => Promise<void>;
  disabled?: boolean;
}

const TIPS = [
  { amount: 1,  emoji: '👏', color: '#7A5CFF' },
  { amount: 2,  emoji: '❤️', color: '#FF2D9A' },
  { amount: 5,  emoji: '🔥', color: '#FF6B35' },
  { amount: 10, emoji: '⭐', color: '#FFD700' },
];

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export function TipBar({ onSendTip, disabled }: TipBarProps) {
  const [bursts, setBursts] = useState<TipBurst[]>([]);

  const handleTip = (amount: number) => {
    if (disabled) return;
    const burst: TipBurst = {
      id: `${Date.now()}_${Math.random()}`,
      amount,
      x: rand(-30, 30),
    };
    setBursts(prev => [...prev, burst]);
    setTimeout(() => {
      setBursts(prev => prev.filter(b => b.id !== burst.id));
    }, 1600);
    onSendTip(amount).catch(console.error);
  };

  return (
    <div className="flex flex-col items-center gap-3 relative">
      {/* Burst animations */}
      <AnimatePresence>
        {bursts.map(burst => (
          <motion.div
            key={burst.id}
            className="absolute pointer-events-none z-10 font-black text-base select-none"
            style={{ bottom: 0, left: '50%', color: '#00FFB2' }}
            initial={{ opacity: 1, y: 0, x: burst.x, scale: 1 }}
            animate={{ opacity: 0, y: -140, x: burst.x + rand(-15, 15), scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          >
            +${burst.amount}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Header label */}
      <span className="text-white/30 text-[9px] uppercase tracking-widest font-bold">Applause</span>

      {/* Tip buttons */}
      {TIPS.map(({ amount, emoji, color }) => (
        <motion.button
          key={amount}
          whileTap={{ scale: 0.82 }}
          onClick={() => handleTip(amount)}
          disabled={disabled}
          className="flex flex-col items-center gap-1 group disabled:opacity-30 disabled:pointer-events-none"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
            style={{
              background: `${color}18`,
              border: `1.5px solid ${color}40`,
            }}
          >
            <span className="text-xl leading-none">{emoji}</span>
          </div>
          <span
            className="text-[10px] font-black"
            style={{ color }}
          >
            ${amount}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
