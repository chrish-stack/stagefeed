import { cn } from '@/lib/cn';
import { type PerformanceCategory, CATEGORY_COLORS } from '@/types';

interface BadgeProps {
  category?: PerformanceCategory | string;
  live?: boolean;
  className?: string;
}

export function Badge({ category, live, className }: BadgeProps) {
  if (live) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FF3B3B]/20 text-[#FF3B3B] border border-[#FF3B3B]/30', className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3B] animate-live-pulse" />
        LIVE
      </span>
    );
  }

  const color = category ? (CATEGORY_COLORS[category as PerformanceCategory] ?? '#7A5CFF') : '#7A5CFF';

  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold', className)}
      style={{
        background: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {category || 'Performance'}
    </span>
  );
}
