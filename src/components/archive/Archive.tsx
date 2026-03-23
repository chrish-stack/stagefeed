import { useState, useRef } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarView } from './CalendarView';
import { PerformanceViewer } from './PerformanceViewer';
import { PERFORMANCE_CATEGORIES, CATEGORY_COLORS } from '@/types';
import type { Performance, PerformanceCategory } from '@/types';
import { cn } from '@/lib/cn';

interface ArchiveProps {
  performances: Performance[];
  onViewProfile: (uid: string) => void;
}

export function Archive({ performances, onViewProfile }: ArchiveProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PerformanceCategory | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Get categories that actually have performances
  const usedCategories = Array.from(
    new Set(performances.map(p => p.category as PerformanceCategory))
  );

  const filtered = performances.filter(p => {
    const dateOk = !selectedDate || isSameDay(new Date(p.startTime), selectedDate);
    const catOk = !selectedCategory || p.category === selectedCategory;
    return dateOk && catOk;
  });

  // Most recent first
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  const clearFilters = () => {
    setSelectedDate(null);
    setSelectedCategory(null);
    setShowCalendar(false);
  };

  const hasFilter = !!selectedDate || !!selectedCategory;

  return (
    <div className="h-full bg-midnight flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="shrink-0 safe-top pt-4 pb-2 px-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black gradient-text leading-tight">Show History</h1>
          <p className="text-white/30 text-xs mt-0.5">{performances.length} performances</p>
        </div>
        <div className="flex items-center gap-2">
          {hasFilter && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-white/50 glass px-3 py-1.5 rounded-full hover:text-white transition-colors"
            >
              <X size={11} />
              Clear
            </button>
          )}
          <button
            onClick={() => setShowCalendar(v => !v)}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all',
              showCalendar ? 'glow-purple' : 'glass'
            )}
            style={showCalendar ? { background: 'var(--gradient-stage)' } : {}}
            aria-label="Toggle calendar"
          >
            <CalendarDays size={15} className={showCalendar ? 'text-white' : 'text-white/60'} />
          </button>
        </div>
      </div>

      {/* ── Calendar (collapsible) ── */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="shrink-0 overflow-hidden"
          >
            <div className="pb-2">
              <CalendarView
                performances={performances}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Category filter chips ── */}
      {usedCategories.length > 1 && (
        <div
          ref={filterRef}
          className="shrink-0 flex gap-2 overflow-x-auto scrollbar-hide px-5 pb-3 pt-1"
        >
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap',
              !selectedCategory
                ? 'text-white glow-purple'
                : 'glass text-white/50 hover:text-white/80'
            )}
            style={!selectedCategory ? { background: 'var(--gradient-stage)' } : {}}
          >
            All
          </button>
          {usedCategories.map(cat => {
            const isActive = selectedCategory === cat;
            const color = CATEGORY_COLORS[cat] ?? '#7A5CFF';
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isActive ? null : cat)}
                className={cn(
                  'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap',
                  isActive ? 'text-white' : 'glass text-white/50 hover:text-white/80'
                )}
                style={
                  isActive
                    ? { background: color, boxShadow: `0 0 16px ${color}50` }
                    : {}
                }
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Performance viewer (fills remaining height) ── */}
      <PerformanceViewer performances={sorted} onViewProfile={onViewProfile} />
    </div>
  );
}
