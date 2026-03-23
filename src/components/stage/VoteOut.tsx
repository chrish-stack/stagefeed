import { ThumbsDown } from 'lucide-react';

interface VoteOutProps {
  voteCount: number;
  viewerCount: number;
  hasVoted: boolean;
  onVote: () => void;
  disabled?: boolean;
}

export function VoteOut({ voteCount, viewerCount, hasVoted, onVote, disabled }: VoteOutProps) {
  const threshold = Math.max(2, Math.ceil(viewerCount * 0.3));
  const progress = Math.min(1, voteCount / threshold);

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        {/* Progress arc */}
        <svg width="44" height="44" className="-rotate-90 absolute inset-0 pointer-events-none">
          <circle cx="22" cy="22" r={radius} fill="none" stroke="rgba(255,59,59,0.15)" strokeWidth="2.5" />
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="#FF3B3B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <button
          onClick={onVote}
          disabled={disabled || hasVoted}
          className="w-11 h-11 rounded-full glass flex items-center justify-center transition-all active:scale-90 hover:bg-[#FF3B3B]/20 disabled:opacity-40 disabled:pointer-events-none"
        >
          <ThumbsDown
            size={18}
            className={hasVoted ? 'text-[#FF3B3B]' : 'text-white/60'}
          />
        </button>
      </div>
      <span className="text-[#FF3B3B] text-[10px] font-bold tabular-nums">
        {voteCount}/{threshold}
      </span>
    </div>
  );
}
