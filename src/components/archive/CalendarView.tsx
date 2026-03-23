import { useRef } from 'react';
import { format, isSameDay, startOfMonth, getDaysInMonth, addDays } from 'date-fns';
import { cn } from '@/lib/cn';
import type { Performance } from '@/types';

interface CalendarViewProps {
  performances: Performance[];
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
}

export function CalendarView({ performances, selectedDate, onSelectDate }: CalendarViewProps) {
  const today = new Date();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build last 30 days
  const days: Date[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }

  const hasPerformances = (date: Date) =>
    performances.some(p => isSameDay(new Date(p.startTime), date));

  const isSelected = (date: Date) => selectedDate && isSameDay(date, selectedDate);
  const isToday = (date: Date) => isSameDay(date, today);

  return (
    <div>
      <p className="text-white/30 text-xs uppercase tracking-widest mb-3 px-4">Calendar</p>
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-2"
      >
        {/* "All" chip */}
        <button
          onClick={() => onSelectDate(null)}
          className={cn(
            'flex flex-col items-center justify-center px-3 py-2 rounded-2xl shrink-0 transition-all',
            !selectedDate
              ? 'text-white font-bold glow-purple'
              : 'glass text-white/50'
          )}
          style={!selectedDate ? { background: 'var(--gradient-stage)' } : {}}
        >
          <span className="text-xs">All</span>
        </button>

        {days.map((day, i) => {
          const has = hasPerformances(day);
          const sel = isSelected(day);
          const tod = isToday(day);
          return (
            <button
              key={i}
              onClick={() => onSelectDate(sel ? null : day)}
              className={cn(
                'flex flex-col items-center gap-1 px-2.5 py-2 rounded-2xl shrink-0 transition-all min-w-[44px]',
                sel ? 'text-white font-bold' : 'glass text-white/60',
                tod && !sel && 'border border-purple/40'
              )}
              style={sel ? { background: 'var(--gradient-stage)' } : {}}
            >
              <span className="text-[10px] uppercase">{format(day, 'EEE')}</span>
              <span className="text-sm font-bold">{format(day, 'd')}</span>
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: has ? '#7A5CFF' : 'transparent' }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
