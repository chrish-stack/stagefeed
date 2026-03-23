import AgoraRTC, {
  type IAgoraRTCClient,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
  type IRemoteVideoTrack,
  type IRemoteAudioTrack,
} from 'agora-rtc-sdk-ng';

export const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID as string;

// Singleton clients — prevents duplicate client creation on re-renders
let hostClient: IAgoraRTCClient | null = null;
let audienceClient: IAgoraRTCClient | null = null;

export function getHostClient(): IAgoraRTCClient {
  if (!hostClient) {
    hostClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
  }
  return hostClient;
}

export function getAudienceClient(): IAgoraRTCClient {
  if (!audienceClient) {
    audienceClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
  }
  return audienceClient;
}

export async function createLocalTracks(): Promise<[IMicrophoneAudioTrack, ICameraVideoTrack]> {
  return AgoraRTC.createMicrophoneAndCameraTracks(
    { encoderConfig: 'high_quality' },
    {
      encoderConfig: {
        width: { min: 640, ideal: 720, max: 1280 },
        height: { min: 480, ideal: 1280, max: 1920 },
        frameRate: 30,
        bitrateMax: 2000,
      },
    }
  );
}

export type {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
};
