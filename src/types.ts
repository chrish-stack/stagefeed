export type UserRole = 'user' | 'admin' | 'moderator';

export const PERFORMANCE_CATEGORIES = [
  'Stand-Up Comedy',
  'Music Performance',
  'Singing',
  'Freestyle Rap',
  'DJ Performance',
  'Instrument Performance',
  'Poetry / Spoken Word',
  'Storytelling',
  'Public Speaking',
  'Motivational Speaking',
  'Magic Tricks',
  'Dance Performance',
  'Beatboxing',
  'Impressions / Voice Acting',
  'Talent Showcase',
  'Skill Demonstration',
  'Art Creation',
  'Educational Talk',
  'Debate / Opinion',
  'Gaming Challenge',
  'Physical Skill / Trick',
  'Freestyle Talent',
] as const;

export type PerformanceCategory = typeof PERFORMANCE_CATEGORIES[number];

export const CATEGORY_COLORS: Record<PerformanceCategory, string> = {
  'Stand-Up Comedy': '#7A5CFF',
  'Music Performance': '#FF2D9A',
  'Singing': '#FF2D9A',
  'Freestyle Rap': '#FF2D9A',
  'DJ Performance': '#2DA8FF',
  'Instrument Performance': '#FF2D9A',
  'Poetry / Spoken Word': '#7A5CFF',
  'Storytelling': '#7A5CFF',
  'Public Speaking': '#2DA8FF',
  'Motivational Speaking': '#2DA8FF',
  'Magic Tricks': '#00FFB2',
  'Dance Performance': '#FF2D9A',
  'Beatboxing': '#FF2D9A',
  'Impressions / Voice Acting': '#7A5CFF',
  'Talent Showcase': '#7A5CFF',
  'Skill Demonstration': '#00FFB2',
  'Art Creation': '#00FFB2',
  'Educational Talk': '#2DA8FF',
  'Debate / Opinion': '#FF3B3B',
  'Gaming Challenge': '#2DA8FF',
  'Physical Skill / Trick': '#00FFB2',
  'Freestyle Talent': '#7A5CFF',
};

export interface UserProfile {
  uid: string;
  username: string;
  bio?: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
  performanceHistory?: string[];
  profileVisibility?: 'public' | 'private';
  followerCount?: number;
  followingCount?: number;
}

export interface UserPrivate {
  earnings: number;
  linkedAccounts?: {
    cashapp?: string;
    venmo?: string;
    zelle?: string;
  };
}

export interface QueueEntry {
  uid: string;
  username: string;
  photoURL?: string;
  joinedAt: string;
  status: 'waiting' | 'preparing' | 'live';
  category: PerformanceCategory;
}

export interface Performance {
  id: string;
  performerUid: string;
  performerName: string;
  performerPhoto?: string;
  category: PerformanceCategory;
  startTime: string;
  endTime?: string;
  totalEarnings: number;
  duration: number;
  status: 'active' | 'completed' | 'voted_out';
  outcome?: 'timer_ended' | 'voted_out';
  tipCount: number;
  viewerPeak: number;
  chatActivity: number;
  archiveVideoUrl?: string;
}

export interface Tip {
  id: string;
  performanceId: string;
  senderUid: string;
  senderName: string;
  amount: number;
  extensionSeconds: number;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  performanceId: string;
  senderUid: string;
  senderName: string;
  senderPhoto?: string;
  message: string;
  timestamp: string;
}

export interface GlobalState {
  currentPerformanceId: string | null;
  stageEndTime: string | null;
  activeViewers: number;
}

export interface VoteOut {
  voterUid: string;
  timestamp: string;
}

export type PanelId = 0 | 1 | 2; // 0=Archive, 1=Stage, 2=Backstage
