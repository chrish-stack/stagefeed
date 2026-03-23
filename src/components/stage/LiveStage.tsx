import { useState } from 'react';
import { Users, ChevronUp, Mic, MicOff, Camera, CameraOff, List } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Timer } from './Timer';
import { TipBar } from './TipBar';
import { VoteOut } from './VoteOut';
import { LiveChat } from './LiveChat';
import { VideoPlayer } from './VideoPlayer';
import { EmptyStage } from './EmptyStage';
import { QueuePanel } from '@/components/queue/QueuePanel';
import type { Performance, GlobalState, QueueEntry, PerformanceCategory } from '@/types';
import type { UseAgoraReturn } from '@/hooks/useAgora';
import type { ChatMessage } from '@/types';
import type { Tip } from '@/types';
import type { User as FirebaseUser } from 'firebase/auth';
import { CATEGORY_COLORS } from '@/types';

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

      {/* TOP gradient overlay */}
      <div className="absolute inset-x-0 top-0 h-40 pointer-events-none" style={{ background: 'var(--gradient-top)' }} />
      {/* BOTTOM gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-64 pointer-events-none" style={{ background: 'var(--gradient-bottom)' }} />

      {/* TOP HUD */}
      <div className="absolute top-0 inset-x-0 safe-top px-4 pt-4 flex items-start justify-between z-20">
        {/* Left: LIVE badge + viewers + category */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Badge live />
            <div className="flex items-center gap-1 glass-dark rounded-full px-2.5 py-1">
              <Users size={11} className="text-white/50" />
              <span className="text-white/70 text-xs font-semibold">{globalState?.activeViewers ?? 1}</span>
            </div>
          </div>
          <Badge category={performance.category} />
        </div>

        {/* Right: Timer + controls */}
        <div className="flex flex-col items-end gap-2">
          <Timer timeLeft={timeLeft} totalTime={performance.duration} />

          {/* Host controls */}
          {isHost && (
            <div className="flex gap-2">
              <button
                onClick={agora.toggleMute}
                className="w-8 h-8 rounded-full glass flex items-center justify-center transition-all active:scale-90"
              >
                {agora.isMuted ? <MicOff size={14} className="text-[#FF3B3B]" /> : <Mic size={14} className="text-white/70" />}
              </button>
              <button
                onClick={agora.toggleCamera}
                className="w-8 h-8 rounded-full glass flex items-center justify-center transition-all active:scale-90"
              >
                {agora.isCameraOff ? <CameraOff size={14} className="text-[#FF3B3B]" /> : <Camera size={14} className="text-white/70" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT ACTION RAIL */}
      <div className="absolute right-3 bottom-36 flex flex-col items-center gap-4 z-20">
        <TipBar onSendTip={onSendTip} disabled={isHost || !user} />
        {!isHost && user && (
          <VoteOut
            voteCount={voteCount}
            viewerCount={globalState?.activeViewers ?? 1}
            hasVoted={hasVoted}
            onVote={onVoteOut}
          />
        )}
        <button
          onClick={() => setQueueOpen(true)}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
            <List size={18} className="text-white/70" />
          </div>
          <span className="text-white/40 text-[10px]">{queue.length}</span>
        </button>
      </div>

      {/* BOTTOM: Performer info + Chat */}
      <div className="absolute bottom-0 inset-x-0 safe-bottom px-4 pb-5 z-20 flex items-end gap-4">
        {/* Left: Chat + performer info */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <LiveChat
            messages={chatMessages}
            input={chatInput}
            onInputChange={onChatInputChange}
            onSend={onChatSend}
            performerUid={performance.performerUid}
            isLoggedIn={!!user}
          />
          {/* Performer info */}
          <button
            onClick={() => onViewProfile(performance.performerUid)}
            className="flex items-center gap-3 group"
          >
            <Avatar
              src={performance.performerPhoto}
              username={performance.performerName}
              size="md"
              ring
            />
            <div className="min-w-0">
              <p className="font-bold text-sm leading-tight truncate group-hover:text-purple transition-colors">
                {performance.performerName}
              </p>
              {tips.length > 0 && (
                <p className="text-[#00FFB2] text-xs font-semibold">
                  ${performance.totalEarnings.toFixed(2)} earned
                </p>
              )}
            </div>
          </button>
        </div>

        {/* Right: spacer for action rail */}
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

// Inline category selector modal (used in two places)
import { PERFORMANCE_CATEGORIES } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CATEGORY_COLORS as CC } from '@/types';

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
  return (
    <Modal open title="Choose Your Performance" onClose={onClose}>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {PERFORMANCE_CATEGORIES.map(cat => {
          const color = CC[cat] ?? '#7A5CFF';
          const isSelected = selected === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className="px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all"
              style={{
                background: isSelected ? `${color}25` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isSelected ? color : 'rgba(255,255,255,0.08)'}`,
                color: isSelected ? color : 'rgba(255,255,255,0.7)',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>
      <Button variant="gradient" size="lg" className="w-full font-black" onClick={onConfirm}>
        Take the Stage
      </Button>
    </Modal>
  );
}
