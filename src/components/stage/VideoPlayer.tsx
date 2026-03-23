import { cn } from '@/lib/cn';
import type { UseAgoraReturn } from '@/hooks/useAgora';

interface VideoPlayerProps {
  agora: UseAgoraReturn;
  isHost: boolean;
}

export function VideoPlayer({ agora, isHost }: VideoPlayerProps) {
  return (
    <div className="absolute inset-0 bg-midnight-2">
      {/* Local (host) video */}
      <div
        ref={agora.localVideoRef}
        className={cn('absolute inset-0 w-full h-full', isHost ? 'block' : 'hidden')}
      />

      {/* Remote (audience) video */}
      <div
        ref={agora.remoteVideoRef}
        className={cn('absolute inset-0 w-full h-full', !isHost ? 'block' : 'hidden')}
      />

      {/* Connecting state */}
      {!agora.isConnected && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-midnight-2">
          <div className="w-10 h-10 rounded-full gradient-bg animate-pulse glow-purple" />
          <p className="text-white/40 text-sm">
            {agora.error ?? 'Connecting to stage…'}
          </p>
        </div>
      )}

      {/* Host camera off state */}
      {isHost && agora.isCameraOff && agora.isConnected && (
        <div className="absolute inset-0 flex items-center justify-center bg-midnight-2">
          <p className="text-white/30 text-sm">Camera is off</p>
        </div>
      )}
    </div>
  );
}
