import { motion } from 'framer-motion';
import { History, Mic, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { PanelId } from '@/types';

interface BottomNavProps {
  activePanel: PanelId;
  isLive?: boolean;
  onNavigate: (panel: PanelId) => void;
}

const TABS = [
  { id: 0 as PanelId, icon: History, label: 'History' },
  { id: 1 as PanelId, icon: Mic,     label: 'Stage'   },
  { id: 2 as PanelId, icon: User,    label: 'Profile'  },
] as const;

export function BottomNav({ activePanel, isLive, onNavigate }: BottomNavProps) {
  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 safe-bottom"
      style={{
        background: 'rgba(11,11,20,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center justify-around h-[60px] px-2">
        {TABS.map(({ id, icon: Icon, label }) => {
          const isActive = activePanel === id;
          const isStage = id === 1;

          if (isStage) {
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className="relative flex flex-col items-center justify-center -mt-5 focus:outline-none"
                aria-label={label}
              >
                {/* Stage button — raised gradient circle */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    'w-[58px] h-[58px] rounded-full flex items-center justify-center shadow-2xl',
                    isActive ? 'glow-purple' : ''
                  )}
                  style={{
                    background: 'linear-gradient(135deg, #7A5CFF 0%, #FF2D9A 50%, #2DA8FF 100%)',
                    boxShadow: isActive
                      ? '0 0 0 3px rgba(122,92,255,0.35), 0 8px 32px rgba(122,92,255,0.45)'
                      : '0 4px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  <Icon size={24} className="text-white" strokeWidth={2} />

                  {/* Live dot */}
                  {isLive && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-[#FF3B3B] border-2 border-[#0B0B14] animate-live-pulse" />
                  )}
                </motion.div>

                <span
                  className="text-[10px] font-bold mt-1 transition-colors"
                  style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.4)' }}
                >
                  {isLive ? 'LIVE' : label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="relative flex flex-col items-center justify-center gap-1 w-16 h-full focus:outline-none"
              aria-label={label}
            >
              <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center gap-1">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.38)' }}
                />
                <span
                  className="text-[10px] font-semibold transition-colors"
                  style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.38)' }}
                >
                  {label}
                </span>
              </motion.div>

              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-1 w-1 h-1 rounded-full"
                  style={{ background: 'white' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
