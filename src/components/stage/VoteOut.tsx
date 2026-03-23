import { motion } from 'framer-motion';
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

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-12 h-12">
        {/* Progress arc */}
        <svg width="48" height="48" className="-rotate-90 absolute inset-0 pointer-events-none">
          <circle cx="24" cy="24" r={radius} fill="none" stroke="rgba(255,59,59,0.12)" strokeWidth="2.5" />
          <circle
            cx="24"
            cy="24"
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
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onVote}
          disabled={disabled || hasVoted}
          className="absolute inset-0 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none"
          style={{
            background: hasVoted ? 'rgba(255,59,59,0.2)' : 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <ThumbsDown
            size={18}
            className={hasVoted ? 'text-[#FF3B3B]' : 'text-white/60'}
            fill={hasVoted ? '#FF3B3B' : 'none'}
          />
        </motion.button>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-black tabular-nums" style={{ color: '#FF3B3B' }}>
          {voteCount}/{threshold}
        </span>
        <span className="text-white/30 text-[9px]">Vote</span>
      </div>
    </div>
  );
}
