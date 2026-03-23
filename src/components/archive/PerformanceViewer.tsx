import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { CATEGORY_COLORS } from '@/types';
import type { Performance, PerformanceCategory } from '@/types';

interface PerformanceViewerProps {
  performances: Performance[];
  onViewProfile: (uid: string) => void;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? '60%' : '-60%', opacity: 0, scale: 0.92 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: d < 0 ? '60%' : '-60%', opacity: 0, scale: 0.92 }),
};

export function PerformanceViewer({ performances, onViewProfile }: PerformanceViewerProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = useCallback((next: number) => {
    if (next < 0 || next >= performances.length) return;
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  }, [index, performances.length]);

  if (performances.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-16 h-16 rounded-full gradient-bg opacity-20" />
        <p className="text-white/30 text-sm">No performances yet</p>
      </div>
    );
  }

  const p = performances[Math.min(index, performances.length - 1)];
  const accentColor = CATEGORY_COLORS[p.category as PerformanceCategory] ?? '#7A5CFF';

  return (
    <div className="flex-1 relative min-h-0">
      {/* Cards area */}
      <div className="absolute inset-0">
        <AnimatePresence custom={direction} initial={false} mode="popLayout">
          <motion.div
            key={p.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.75 }}
            className="absolute inset-x-4 inset-y-2 rounded-3xl overflow-hidden"
            style={{ boxShadow: `0 0 60px ${accentColor}30` }}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-[#0D0D1A]">
              {p.performerPhoto ? (
                <img
                  src={p.performerPhoto}
                  alt={p.performerName}
                  className="w-full h-full object-cover opacity-35"
                  referrerPolicy="no-referrer"
                  draggable={false}
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    background: `radial-gradient(ellipse at 50% 30%, ${accentColor}30 0%, #0D0D1A 65%)`,
                  }}
                />
              )}

              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(11,11,20,0.5) 0%, transparent 35%, transparent 45%, rgba(11,11,20,0.97) 90%)',
                }}
              />
            </div>

            {/* Accent glow */}
            <div
              className="absolute inset-x-0 top-1/3 h-56 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at center, ${accentColor}18 0%, transparent 70%)` }}
            />

            {/* Voted-out ribbon */}
            {p.status === 'voted_out' && (
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-[#FF3B3B]/90 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Voted Out
                </span>
              </div>
            )}

            {/* Bottom info */}
            <div className="absolute bottom-0 inset-x-0 px-5 pb-6 pt-20">
              <Badge category={p.category as PerformanceCategory} className="mb-3" />

              <button
                onClick={() => onViewProfile(p.performerUid)}
                className="flex items-center gap-3 mb-4 group text-left"
              >
                <Avatar src={p.performerPhoto} username={p.performerName} size="md" ring />
                <div>
                  <p className="font-black text-lg leading-tight group-hover:opacity-75 transition-opacity">
                    {p.performerName}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {formatDistanceToNow(new Date(p.startTime), { addSuffix: true })}
                  </p>
                </div>
              </button>

              {/* Stats pills */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white/[0.08] backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Clock size={11} className="text-white/40" />
                  <span className="text-white/70 text-xs font-semibold">{formatDuration(p.duration)}</span>
                </div>
                {p.totalEarnings > 0 && (
                  <div className="flex items-center gap-1 bg-white/[0.08] backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="text-[10px]" style={{ color: '#00FFB2' }}>$</span>
                    <span className="text-xs font-black" style={{ color: '#00FFB2' }}>
                      {p.totalEarnings.toFixed(2)}
                    </span>
                  </div>
                )}
                {p.viewerPeak > 0 && (
                  <div className="flex items-center gap-1.5 bg-white/[0.08] backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Users size={11} className="text-white/40" />
                    <span className="text-white/70 text-xs font-semibold">{p.viewerPeak}</span>
                  </div>
                )}
                {p.tipCount > 0 && (
                  <div className="bg-white/[0.08] backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="text-white/50 text-xs">{p.tipCount} applause</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile tap zones — left and right thirds, top 55% only (leaves bottom info interactive) */}
      <button
        className="absolute left-0 top-0 w-1/3 h-[55%] z-20 md:hidden"
        onClick={() => goTo(index - 1)}
        aria-label="Previous performance"
      />
      <button
        className="absolute right-0 top-0 w-1/3 h-[55%] z-20 md:hidden"
        onClick={() => goTo(index + 1)}
        aria-label="Next performance"
      />

      {/* Navigation arrows — desktop: centred; mobile: edge-visible */}
      <button
        onClick={() => goTo(index - 1)}
        disabled={index === 0}
        className="absolute left-5 top-1/2 -translate-y-1/2 z-20 flex w-9 h-9 md:w-11 md:h-11 rounded-full items-center justify-center transition-all disabled:opacity-0"
        style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
        aria-label="Previous"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => goTo(index + 1)}
        disabled={index >= performances.length - 1}
        className="absolute right-5 top-1/2 -translate-y-1/2 z-20 flex w-9 h-9 md:w-11 md:h-11 rounded-full items-center justify-center transition-all disabled:opacity-0"
        style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
        aria-label="Next"
      >
        <ChevronRight size={18} />
      </button>

      {/* Progress indicator */}
      {performances.length > 1 && (
        <div className="absolute top-6 inset-x-0 flex justify-center items-center gap-1.5 z-20 pointer-events-none">
          {performances.length <= 10 ? (
            performances.map((_, i) => (
              <div
                key={i}
                className="h-[3px] rounded-full transition-all duration-300"
                style={{
                  width: i === index ? 22 : 6,
                  background: i === index ? '#7A5CFF' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))
          ) : (
            <span
              className="text-white/50 text-xs px-3 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
            >
              {index + 1} / {performances.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
