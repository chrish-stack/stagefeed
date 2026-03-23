import { useState } from 'react';
import { ChevronLeft, Settings, Grid3X3, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { WalletWidget } from './WalletWidget';
import { useProfile } from '@/hooks/useProfile';
import type { UserPrivate, PerformanceCategory } from '@/types';
import type { User as FirebaseUser } from 'firebase/auth';

interface ProfileProps {
  uid: string;
  currentUser: FirebaseUser | null;
  onBack?: () => void;
  onSignOut: () => void;
  currentUserPrivateData?: UserPrivate | null;
  onUpdatePrivate?: (updates: Partial<UserPrivate>) => Promise<void>;
}

export function Profile({
  uid,
  currentUser,
  onBack,
  onSignOut,
  currentUserPrivateData,
  onUpdatePrivate,
}: ProfileProps) {
  const { profile, isFollowing, isOwn, follow, unfollow } = useProfile(uid, currentUser);
  const [followLoading, setFollowLoading] = useState(false);

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    try {
      isFollowing ? await unfollow() : await follow();
    } finally {
      setFollowLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="h-full bg-midnight flex items-center justify-center">
        <div className="w-8 h-8 rounded-full gradient-bg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="h-full bg-midnight overflow-y-auto overscroll-y-contain scrollbar-hide">
      {/* Cover area */}
      <div className="relative h-44 shrink-0">
        <div className="absolute inset-0 gradient-bg opacity-20" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, #0B0B14 100%)' }} />

        {/* Top nav */}
        <div className="absolute top-0 inset-x-0 safe-top pt-4 px-4 flex items-center justify-between z-10">
          {onBack ? (
            <button onClick={onBack} className="w-9 h-9 rounded-full glass flex items-center justify-center">
              <ChevronLeft size={18} />
            </button>
          ) : <div />}
          {isOwn && (
            <button onClick={onSignOut} className="w-9 h-9 rounded-full glass flex items-center justify-center">
              <LogOut size={15} className="text-white/60" />
            </button>
          )}
        </div>

        {/* Avatar overlapping bottom edge */}
        <div className="absolute -bottom-10 left-5 z-10">
          <Avatar src={profile.photoURL} username={profile.username} size="xl" ring />
        </div>
      </div>

      {/* Content */}
      <div className="pt-14 px-5 pb-10">
        {/* Name + follow */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-2xl font-black">{profile.username}</h1>
            {profile.bio && <p className="text-white/50 text-sm mt-1">{profile.bio}</p>}
          </div>
          {!isOwn && currentUser && (
            <Button
              variant={isFollowing ? 'secondary' : 'gradient'}
              size="sm"
              loading={followLoading}
              onClick={handleFollowToggle}
              className="shrink-0 ml-3"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-5 mt-4 mb-6">
          {[
            { label: 'Shows', value: profile.performanceHistory?.length ?? 0 },
            { label: 'Followers', value: profile.followerCount ?? 0 },
            { label: 'Following', value: profile.followingCount ?? 0 },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xl font-black">{value}</p>
              <p className="text-white/40 text-xs">{label}</p>
            </div>
          ))}
        </div>

        {/* Wallet — own profile only */}
        {isOwn && currentUserPrivateData && onUpdatePrivate && (
          <WalletWidget privateData={currentUserPrivateData} onUpdatePrivate={onUpdatePrivate} />
        )}

        {/* Performance history grid placeholder */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Grid3X3 size={14} className="text-white/40" />
            <p className="text-white/40 text-xs uppercase tracking-widest">Performances</p>
          </div>

          {(profile.performanceHistory?.length ?? 0) === 0 ? (
            <div className="glass rounded-2xl py-10 text-center">
              <p className="text-white/30 text-sm">No performances yet</p>
              {isOwn && <p className="text-white/20 text-xs mt-1">Take the stage to get started</p>}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {(profile.performanceHistory ?? []).slice(0, 9).map((id, i) => (
                <div
                  key={id}
                  className="aspect-square rounded-xl bg-white/5 flex items-center justify-center overflow-hidden"
                >
                  <div className="w-full h-full gradient-bg opacity-20" style={{ animationDelay: `${i * 0.1}s` }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
