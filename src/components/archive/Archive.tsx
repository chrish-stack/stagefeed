import { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { CalendarView } from './CalendarView';
import { PerformanceCard } from './PerformanceCard';
import type { Performance } from '@/types';

interface ArchiveProps {
  performances: Performance[];
  onViewProfile: (uid: string) => void;
}

function groupByDate(performances: Performance[]): Record<string, Performance[]> {
  const groups: Record<string, Performance[]> = {};
  for (const p of performances) {
    const key = format(new Date(p.startTime), 'yyyy-MM-dd');
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }
  return groups;
}

export function Archive({ performances, onViewProfile }: ArchiveProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const filtered = selectedDate
    ? performances.filter(p => isSameDay(new Date(p.startTime), selectedDate))
    : performances;

  const grouped = groupByDate([...filtered].reverse()); // most recent first
  const dateKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="h-full bg-midnight overflow-y-auto overscroll-y-contain scrollbar-hide">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-midnight/90 backdrop-blur-md safe-top pt-4 pb-3">
        <div className="px-4 mb-4">
          <h1 className="text-2xl font-black gradient-text">Show History</h1>
          <p className="text-white/30 text-sm">{performances.length} performances</p>
        </div>
        <CalendarView
          performances={performances}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>

      {/* Performance list */}
      <div className="px-4 pt-4 pb-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full gradient-bg opacity-30 mb-4" />
            <p className="text-white/30 text-sm">
              {selectedDate ? 'No performances on this day' : 'No performances yet'}
            </p>
          </div>
        ) : (
          dateKeys.map(key => (
            <div key={key} className="mb-6">
              <p className="text-white/30 text-xs uppercase tracking-widest mb-3 font-semibold">
                {format(new Date(key), 'EEEE, MMMM d')}
              </p>
              <div className="flex flex-col gap-3">
                {grouped[key].map(p => (
                  <PerformanceCard
                    key={p.id}
                    performance={p}
                    onViewProfile={onViewProfile}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
