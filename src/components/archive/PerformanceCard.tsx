import { Play } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { Performance, PerformanceCategory } from '@/types';

interface PerformanceCardProps {
  performance: Performance;
  onViewProfile: (uid: string) => void;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function PerformanceCard({ performance, onViewProfile }: PerformanceCardProps) {
  const timeAgo = formatDistanceToNow(new Date(performance.startTime), { addSuffix: true });

  return (
    <div className="flex items-center gap-4 p-4 glass rounded-2xl">
      {/* Thumbnail */}
      <button
        onClick={() => onViewProfile(performance.performerUid)}
        className="w-14 h-20 rounded-xl overflow-hidden relative shrink-0 bg-white/5 group"
      >
        {performance.performerPhoto ? (
          <img
            src={performance.performerPhoto}
            alt={performance.performerName}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full gradient-bg opacity-60" />
        )}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play size={18} className="text-white" fill="white" />
        </div>
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <button
          onClick={() => onViewProfile(performance.performerUid)}
          className="flex items-center gap-2 mb-1.5 hover:opacity-80 transition-opacity"
        >
          <Avatar
            src={performance.performerPhoto}
            username={performance.performerName}
            size="xs"
          />
          <span className="font-bold text-sm truncate">{performance.performerName}</span>
        </button>

        <Badge category={performance.category as PerformanceCategory} className="mb-2" />

        <div className="flex items-center gap-3 text-white/40 text-xs">
          <span>{formatDuration(performance.duration)}</span>
          {performance.totalEarnings > 0 && (
            <span className="text-[#00FFB2]">${performance.totalEarnings.toFixed(2)}</span>
          )}
          <span>{timeAgo}</span>
        </div>
      </div>

      {/* Status */}
      {performance.status === 'voted_out' && (
        <span className="text-[#FF3B3B] text-xs font-bold shrink-0">Voted Out</span>
      )}
    </div>
  );
}
