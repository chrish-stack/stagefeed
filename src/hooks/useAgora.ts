import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AGORA_APP_ID,
  getHostClient,
  getAudienceClient,
  createLocalTracks,
  type IAgoraRTCClient,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
  type IRemoteVideoTrack,
} from '@/lib/agora';

export type AgoraRole = 'host' | 'audience' | 'idle';

export interface UseAgoraReturn {
  role: AgoraRole;
  isConnected: boolean;
  remoteVideoTrack: IRemoteVideoTrack | null;
  localVideoRef: React.RefObject<HTMLDivElement | null>;
  remoteVideoRef: React.RefObject<HTMLDivElement | null>;
  joinAsHost: (channelName: string) => Promise<void>;
  joinAsAudience: (channelName: string) => Promise<void>;
  leave: () => Promise<void>;
  error: string | null;
  isMuted: boolean;
  toggleMute: () => void;
  isCameraOff: boolean;
  toggleCamera: () => void;
}

export function useAgora(): UseAgoraReturn {
  const [role, setRole] = useState<AgoraRole>('idle');
  const [isConnected, setIsConnected] = useState(false);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState<IRemoteVideoTrack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const localVideoRef = useRef<HTMLDivElement | null>(null);
  const remoteVideoRef = useRef<HTMLDivElement | null>(null);
  const tracksRef = useRef<[IMicrophoneAudioTrack, ICameraVideoTrack] | null>(null);
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const channelRef = useRef<string | null>(null);

  const leave = useCallback(async () => {
    try {
      if (tracksRef.current) {
        tracksRef.current.forEach(track => {
          track.stop();
          track.close();
        });
        tracksRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current.removeAllListeners();
        await clientRef.current.leave();
      }
    } catch (_) {
      // ignore leave errors
    }
    channelRef.current = null;
    setRole('idle');
    setIsConnected(false);
    setRemoteVideoTrack(null);
    setError(null);
  }, []);

  const joinAsHost = useCallback(async (channelName: string) => {
    if (channelRef.current === channelName && role === 'host') return;
    await leave();

    setError(null);
    const client = getHostClient();
    clientRef.current = client;

    try {
      await client.setClientRole('host');
      // null token = dev mode (App Certificate disabled in Agora console)
      await client.join(AGORA_APP_ID, channelName, null, null);
      const tracks = await createLocalTracks();
      tracksRef.current = tracks;
      await client.publish(tracks);

      if (localVideoRef.current) {
        tracks[1].play(localVideoRef.current);
      }

      channelRef.current = channelName;
      setRole('host');
      setIsConnected(true);
    } catch (err) {
      console.error('Agora host join failed', err);
      setError('Camera/mic access denied or Agora App ID not set.');
      await leave();
    }
  }, [leave, role]);

  const joinAsAudience = useCallback(async (channelName: string) => {
    if (channelRef.current === channelName && role === 'audience') return;
    await leave();

    setError(null);
    const client = getAudienceClient();
    clientRef.current = client;

    try {
      await client.setClientRole('audience');
      await client.join(AGORA_APP_ID, channelName, null, null);

      client.on('user-published', async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);
        if (mediaType === 'video' && remoteUser.videoTrack) {
          setRemoteVideoTrack(remoteUser.videoTrack);
          if (remoteVideoRef.current) {
            remoteUser.videoTrack.play(remoteVideoRef.current);
          }
        }
        if (mediaType === 'audio' && remoteUser.audioTrack) {
          remoteUser.audioTrack.play();
        }
      });

      client.on('user-unpublished', () => {
        setRemoteVideoTrack(null);
      });

      channelRef.current = channelName;
      setRole('audience');
      setIsConnected(true);
    } catch (err) {
      console.error('Agora audience join failed', err);
      setError('Failed to connect to live stream.');
      await leave();
    }
  }, [leave, role]);

  const toggleMute = useCallback(() => {
    if (!tracksRef.current) return;
    const [audioTrack] = tracksRef.current;
    const newMuted = !isMuted;
    audioTrack.setEnabled(!newMuted);
    setIsMuted(newMuted);
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    if (!tracksRef.current) return;
    const [, videoTrack] = tracksRef.current;
    const newOff = !isCameraOff;
    videoTrack.setEnabled(!newOff);
    setIsCameraOff(newOff);
  }, [isCameraOff]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { leave(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    role,
    isConnected,
    remoteVideoTrack,
    localVideoRef,
    remoteVideoRef,
    joinAsHost,
    joinAsAudience,
    leave,
    error,
    isMuted,
    toggleMute,
    isCameraOff,
    toggleCamera,
  };
}
