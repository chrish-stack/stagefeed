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

const TIP_AMOUNTS = [1, 2, 5, 10];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export function TipBar({ onSendTip, disabled }: TipBarProps) {
  const [bursts, setBursts] = useState<TipBurst[]>([]);

  const handleTip = (amount: number) => {
    if (disabled) return;

    // Optimistic animation — fire before async write
    const burst: TipBurst = {
      id: `${Date.now()}_${Math.random()}`,
      amount,
      x: randomBetween(-40, 40),
    };
    setBursts(prev => [...prev, burst]);
    setTimeout(() => {
      setBursts(prev => prev.filter(b => b.id !== burst.id));
    }, 1400);

    onSendTip(amount).catch(console.error);
  };

  return (
    <div className="flex flex-col items-center gap-3 relative">
      {/* Burst animations */}
      <AnimatePresence>
        {bursts.map(burst => (
          <motion.div
            key={burst.id}
            className="absolute pointer-events-none z-10 text-[#00FFB2] font-black text-sm select-none"
            style={{ bottom: 0, left: '50%' }}
            initial={{ opacity: 1, y: 0, x: burst.x }}
            animate={{ opacity: 0, y: -160, x: burst.x + randomBetween(-20, 20) }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
          >
            +${burst.amount}
          </motion.div>
        ))}
      </AnimatePresence>

      {TIP_AMOUNTS.map(amount => (
        <button
          key={amount}
          onClick={() => handleTip(amount)}
          disabled={disabled}
          className="w-12 h-12 rounded-full glass flex flex-col items-center justify-center transition-all active:scale-90 hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none"
        >
          <span className="text-[#00FFB2] text-xs font-black leading-tight">${amount}</span>
        </button>
      ))}
    </div>
  );
}
