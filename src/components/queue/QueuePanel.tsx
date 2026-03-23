import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { QueueEntry, Performance, PerformanceCategory } from '@/types';
import type { User as FirebaseUser } from 'firebase/auth';

interface QueuePanelProps {
  open: boolean;
  onClose: () => void;
  queue: QueueEntry[];
  currentPerformance: Performance | null;
  isInQueue: boolean;
  queuePosition: number | null;
  user: FirebaseUser | null;
  onJoin: () => void;
  onLeave: () => Promise<void>;
  onViewProfile: (uid: string) => void;
}

export function QueuePanel({
  open,
  onClose,
  queue,
  currentPerformance,
  isInQueue,
  queuePosition,
  user,
  onJoin,
  onLeave,
  onViewProfile,
}: QueuePanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 z-40 glass-dark rounded-t-3xl max-h-[70vh] flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35, mass: 0.8 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <div>
                <h2 className="text-lg font-bold">Up Next</h2>
                <p className="text-white/40 text-xs">{queue.length} in queue</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15"
              >
                <X size={15} />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 px-5 pb-5 safe-bottom">
              {/* Current performer */}
              {currentPerformance && (
                <div className="mb-3">
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-2">On Stage Now</p>
                  <button
                    onClick={() => { onViewProfile(currentPerformance.performerUid); onClose(); }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/8 hover:bg-white/8 transition-colors"
                  >
                    <Avatar
                      src={currentPerformance.performerPhoto}
                      username={currentPerformance.performerName}
                      size="md"
                      ring
                    />
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-bold text-sm truncate">{currentPerformance.performerName}</p>
                    </div>
                    <Badge category={currentPerformance.category as PerformanceCategory} />
                    <Badge live />
                  </button>
                </div>
              )}

              {/* Queue entries */}
              {queue.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/30 text-sm">Queue is empty</p>
                  {user && !isInQueue && (
                    <Button variant="gradient" className="mt-4" onClick={onJoin}>
                      Take the Stage
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Waiting</p>
                  {queue.map((entry, i) => {
                    const isMe = entry.uid === user?.uid;
                    return (
                      <button
                        key={entry.uid}
                        onClick={() => { onViewProfile(entry.uid); onClose(); }}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl transition-colors hover:bg-white/5"
                        style={isMe ? { background: 'rgba(122,92,255,0.1)', border: '1px solid rgba(122,92,255,0.3)' } : {}}
                      >
                        <span className="text-white/30 text-xs w-5 text-center">#{i + 1}</span>
                        <Avatar src={entry.photoURL} username={entry.username} size="sm" />
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {entry.username}{isMe && <span className="text-[#7A5CFF] text-xs ml-1">(you)</span>}
                          </p>
                          <p className="text-white/30 text-xs">{i === 0 ? 'Up next' : `~${i} min wait`}</p>
                        </div>
                        <Badge category={entry.category as PerformanceCategory} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer action */}
            <div className="px-5 py-4 border-t border-white/8 safe-bottom">
              {user && (
                isInQueue ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">You're #{queuePosition} in queue</p>
                      <p className="text-white/40 text-xs">Sit tight — you'll go live soon</p>
                    </div>
                    <Button variant="danger" size="sm" onClick={onLeave}>Leave</Button>
                  </div>
                ) : (
                  <Button variant="gradient" size="lg" className="w-full font-black" onClick={() => { onJoin(); onClose(); }}>
                    Take the Stage
                  </Button>
                )
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
