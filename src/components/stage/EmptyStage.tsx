import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { QueueEntry, PerformanceCategory } from '@/types';

interface EmptyStageProps {
  queue: QueueEntry[];
  isInQueue: boolean;
  queuePosition: number | null;
  onTakeStage: () => void;
  isLoggedIn: boolean;
}

export function EmptyStage({ queue, isInQueue, queuePosition, onTakeStage, isLoggedIn }: EmptyStageProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-midnight px-6">
      {/* Background glow */}
      <div
        className="absolute w-64 h-64 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'var(--gradient-stage)', filter: 'blur(60px)' }}
      />

      {/* Mic icon */}
      <motion.div
        className="relative w-28 h-28 rounded-full gradient-bg flex items-center justify-center mb-6 glow-purple"
        animate={{ scale: [1, 1.04, 1], opacity: [1, 0.85, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Mic size={48} className="text-white" strokeWidth={1.5} />
      </motion.div>

      <h2 className="text-3xl font-black gradient-text text-center">Main Stage is Empty</h2>
      <p className="text-white/40 text-sm mt-2 mb-8 text-center">
        {queue.length > 0
          ? `${queue.length} performer${queue.length > 1 ? 's' : ''} waiting in queue`
          : 'Be the first to perform tonight.'}
      </p>

      {isLoggedIn ? (
        isInQueue ? (
          <motion.div
            className="glass rounded-3xl px-6 py-5 w-full max-w-xs text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">You're in queue</p>
            <p className="text-3xl font-black gradient-text">#{queuePosition ?? '?'}</p>
            <p className="text-white/40 text-xs mt-1">
              {queuePosition === 1 ? "You're up next!" : `Est. ${((queuePosition ?? 2) - 1) * 1} min wait`}
            </p>
          </motion.div>
        ) : (
          <Button variant="gradient" size="lg" onClick={onTakeStage} className="px-12 font-black text-lg">
            Take the Stage
          </Button>
        )
      ) : (
        <p className="text-white/30 text-sm">Sign in to perform</p>
      )}

      {/* Queue preview */}
      {queue.length > 0 && (
        <motion.div
          className="mt-8 w-full max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-white/30 text-xs uppercase tracking-widest mb-3 text-center">Up Next</p>
          <div className="flex flex-col gap-2">
            {queue.slice(0, 3).map((entry, i) => (
              <div key={entry.uid} className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
                <span className="text-white/30 text-xs w-4">#{i + 1}</span>
                <Avatar src={entry.photoURL} username={entry.username} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{entry.username}</p>
                </div>
                <Badge category={entry.category as PerformanceCategory} />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
