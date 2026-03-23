import { useState } from 'react';
import { Users, Mic, MicOff, Camera, CameraOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Timer } from './Timer';
import { TipBar } from './TipBar';
import { VoteOut } from './VoteOut';
import { LiveChat } from './LiveChat';
import { VideoPlayer } from './VideoPlayer';
import { EmptyStage } from './EmptyStage';
import { QueuePanel } from '@/components/queue/QueuePanel';
import { PERFORMANCE_CATEGORIES, CATEGORY_COLORS } from '@/types';
import type { Performance, GlobalState, QueueEntry, PerformanceCategory } from '@/types';
import type { UseAgoraReturn } from '@/hooks/useAgora';
import type { ChatMessage, Tip } from '@/types';
import type { User as FirebaseUser } from 'firebase/auth';

interface LiveStageProps {
  performance: Performance | null;
  globalState: GlobalState | null;
  timeLeft: number;
  queue: QueueEntry[];
  tips: Tip[];
  voteCount: number;
  hasVoted: boolean;
  isInQueue: boolean;
  user: FirebaseUser | null;
  agora: UseAgoraReturn;
  chatMessages: ChatMessage[];
  chatInput: string;
  onChatInputChange: (v: string) => void;
  onChatSend: () => void;
  onSendTip: (amount: number) => Promise<void>;
  onVoteOut: () => void;
  onJoinQueue: (category: PerformanceCategory) => Promise<void>;
  onLeaveQueue: () => Promise<void>;
  onViewProfile: (uid: string) => void;
}

export function LiveStage({
  performance,
  globalState,
  timeLeft,
  queue,
  tips,
  voteCount,
  hasVoted,
  isInQueue,
  user,
  agora,
  chatMessages,
  chatInput,
  onChatInputChange,
  onChatSend,
  onSendTip,
  onVoteOut,
  onJoinQueue,
  onLeaveQueue,
  onViewProfile,
}: LiveStageProps) {
  const [queueOpen, setQueueOpen] = useState(false);
  const [categorySelectOpen, setCategorySelectOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PerformanceCategory>('Freestyle Talent');

  const isHost = performance?.performerUid === user?.uid;
  const categoryColor = performance
    ? (CATEGORY_COLORS[performance.category] ?? '#7A5CFF')
    : '#7A5CFF';

  const handleTakeStage = () => setCategorySelectOpen(true);

  if (!performance) {
    const queuePosition = isInQueue
      ? queue.findIndex(e => e.uid === user?.uid) + 1
      : null;

    return (
      <>
        <EmptyStage
          queue={queue}
          isInQueue={isInQueue}
          queuePosition={queuePosition}
          onTakeStage={handleTakeStage}
          isLoggedIn={!!user}
        />
        {categorySelectOpen && (
          <CategorySelectModal
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            onConfirm={async () => {
              setCategorySelectOpen(false);
              await onJoinQueue(selectedCategory);
            }}
            onClose={() => setCategorySelectOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <div
      className="absolute inset-0 bg-midnight overflow-hidden"
      style={{ '--category-accent': categoryColor } as React.CSSProperties}
    >
      {/* VIDEO LAYER */}
      <VideoPlayer agora={agora} isHost={isHost} />

      {/* TOP gradient */}
      <div
        className="absolute inset-x-0 top-0 h-36 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(11,11,20,0.88) 0%, transparent 100%)' }}
      />
      {/* BOTTOM gradient */}
      <div
        className="absolute inset-x-0 bottom-0 h-72 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(11,11,20,0.97) 0%, rgba(11,11,20,0.6) 50%, transparent 100%)' }}
      />

      {/* ── TOP HUD ── */}
      <div className="absolute top-0 inset-x-0 safe-top px-4 pt-4 flex items-start justify-between z-20">
        {/* Left: LIVE + viewers + category */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge live />
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
            >
              <Users size={12} className="text-white/60" />
              <span className="text-white/80 text-xs font-bold">{globalState?.activeViewers ?? 1}</span>
            </div>
          </div>
          <Badge category={performance.category} />
        </div>

        {/* Right: Timer + host controls */}
        <div className="flex flex-col items-end gap-2">
          <Timer timeLeft={timeLeft} totalTime={performance.duration} />
          {isHost && (
            <div className="flex gap-2">
              <button
                onClick={agora.toggleMute}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
              >
                {agora.isMuted
                  ? <MicOff size={15} className="text-[#FF3B3B]" />
                  : <Mic size={15} className="text-white/80" />}
              </button>
              <button
                onClick={agora.toggleCamera}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
              >
                {agora.isCameraOff
                  ? <CameraOff size={15} className="text-[#FF3B3B]" />
                  : <Camera size={15} className="text-white/80" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT ACTION RAIL — TikTok style ── */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-20">
        {/* Applause / Tip bar */}
        <TipBar onSendTip={onSendTip} disabled={isHost || !user} />

        {/* Vote-out */}
        {!isHost && user && (
          <VoteOut
            voteCount={voteCount}
            viewerCount={globalState?.activeViewers ?? 1}
            hasVoted={hasVoted}
            onVote={onVoteOut}
          />
        )}

        {/* Queue button */}
        <button
          onClick={() => setQueueOpen(true)}
          className="flex flex-col items-center gap-1.5 group"
        >
          <motion.div
            whileTap={{ scale: 0.88 }}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-colors group-hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
          >
            {/* Queue list icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </motion.div>
          {queue.length > 0 && (
            <span className="text-white/50 text-[11px] font-semibold">{queue.length}</span>
          )}
          <span className="text-white/40 text-[10px]">Queue</span>
        </button>
      </div>

      {/* ── BOTTOM: Performer info + Chat ── */}
      <div className="absolute bottom-0 inset-x-0 px-4 pb-4 z-20 flex items-end gap-3">
        {/* Chat + performer */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Live chat */}
          <LiveChat
            messages={chatMessages}
            input={chatInput}
            onInputChange={onChatInputChange}
            onSend={onChatSend}
            performerUid={performance.performerUid}
            isLoggedIn={!!user}
          />

          {/* Performer info row */}
          <button
            onClick={() => onViewProfile(performance.performerUid)}
            className="flex items-center gap-3 group"
          >
            <div className="relative shrink-0">
              <Avatar
                src={performance.performerPhoto}
                username={performance.performerName}
                size="md"
                ring
              />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-base leading-tight truncate group-hover:opacity-80 transition-opacity">
                {performance.performerName}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge category={performance.category} />
                {performance.totalEarnings > 0 && (
                  <span className="text-[#00FFB2] text-xs font-bold">
                    ${performance.totalEarnings.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Spacer for action rail */}
        <div className="w-14 shrink-0" />
      </div>

      {/* QUEUE PANEL */}
      <QueuePanel
        open={queueOpen}
        onClose={() => setQueueOpen(false)}
        queue={queue}
        currentPerformance={performance}
        isInQueue={isInQueue}
        queuePosition={isInQueue ? queue.findIndex(e => e.uid === user?.uid) + 1 : null}
        user={user}
        onJoin={handleTakeStage}
        onLeave={onLeaveQueue}
        onViewProfile={onViewProfile}
      />

      {categorySelectOpen && (
        <CategorySelectModal
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          onConfirm={async () => {
            setCategorySelectOpen(false);
            await onJoinQueue(selectedCategory);
          }}
          onClose={() => setCategorySelectOpen(false)}
        />
      )}
    </div>
  );
}

function CategorySelectModal({
  selected,
  onSelect,
  onConfirm,
  onClose,
}: {
  selected: PerformanceCategory;
  onSelect: (c: PerformanceCategory) => void;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const COLORS = CATEGORY_COLORS;
  return (
    <Modal open title="Choose Your Performance" onClose={onClose}>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {PERFORMANCE_CATEGORIES.map(cat => {
          const color = COLORS[cat] ?? '#7A5CFF';
          const isSelected = selected === cat;
          return (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(cat)}
              className="px-3 py-3 rounded-2xl text-sm font-semibold text-left transition-all"
              style={{
                background: isSelected ? `${color}22` : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${isSelected ? color : 'rgba(255,255,255,0.07)'}`,
                color: isSelected ? color : 'rgba(255,255,255,0.65)',
              }}
            >
              {cat}
            </motion.button>
          );
        })}
      </div>
      <Button variant="gradient" size="lg" className="w-full font-black text-base" onClick={onConfirm}>
        Take the Stage
      </Button>
    </Modal>
  );
}
