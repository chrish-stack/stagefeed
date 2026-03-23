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
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-midnight px-6 overflow-hidden">
      {/* Background ambient glow */}
      <div
        className="absolute w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(122,92,255,0.18) 0%, transparent 70%)',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* Pulsing mic */}
      <div className="relative mb-8">
        {/* Outer ring pulses */}
        {[1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{ background: 'rgba(122,92,255,0.15)' }}
            animate={{ scale: [1, 1.6 + i * 0.4], opacity: [0.5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
          />
        ))}
        <motion.div
          className="relative w-28 h-28 rounded-full gradient-bg flex items-center justify-center shadow-2xl"
          style={{ boxShadow: '0 0 40px rgba(122,92,255,0.5), 0 0 80px rgba(255,45,154,0.2)' }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Mic size={48} className="text-white" strokeWidth={1.5} />
        </motion.div>
      </div>

      {/* Copy */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-3xl font-black gradient-text leading-tight">
          Stage is Empty
        </h2>
        <p className="text-white/40 text-sm mt-2">
          {queue.length > 0
            ? `${queue.length} performer${queue.length !== 1 ? 's' : ''} ready to go`
            : 'Be the first to perform tonight.'}
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 300 }}
      >
        {isLoggedIn ? (
          isInQueue ? (
            <div
              className="rounded-3xl px-8 py-5 text-center"
              style={{
                background: 'rgba(122,92,255,0.1)',
                border: '1px solid rgba(122,92,255,0.3)',
              }}
            >
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1.5">You're in queue</p>
              <p className="text-4xl font-black gradient-text">#{queuePosition ?? '?'}</p>
              <p className="text-white/40 text-xs mt-1.5">
                {queuePosition === 1 ? "You're up next! 🎉" : `Est. ${((queuePosition ?? 2) - 1)} min wait`}
              </p>
            </div>
          ) : (
            <Button
              variant="gradient"
              size="lg"
              onClick={onTakeStage}
              className="px-14 font-black text-lg"
              style={{ boxShadow: '0 8px 32px rgba(122,92,255,0.45)' }}
            >
              <Mic size={20} />
              Take the Stage
            </Button>
          )
        ) : (
          <p className="text-white/30 text-sm">Sign in to perform</p>
        )}
      </motion.div>

      {/* Up next list */}
      {queue.length > 0 && (
        <motion.div
          className="mt-10 w-full max-w-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <p className="text-white/25 text-xs uppercase tracking-widest mb-3 text-center font-semibold">
            Up Next
          </p>
          <div className="flex flex-col gap-2">
            {queue.slice(0, 3).map((entry, i) => (
              <motion.div
                key={entry.uid}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <span className="text-white/25 text-xs font-bold w-5 text-center">{i + 1}</span>
                <Avatar src={entry.photoURL} username={entry.username} size="sm" />
                <p className="flex-1 text-sm font-semibold truncate">{entry.username}</p>
                <Badge category={entry.category as PerformanceCategory} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
