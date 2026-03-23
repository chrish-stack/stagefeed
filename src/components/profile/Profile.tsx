import { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Pencil, Check, X as XIcon,
  Settings, LogOut, Clock, Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { WalletWidget } from './WalletWidget';
import { useProfile } from '@/hooks/useProfile';
import { CATEGORY_COLORS } from '@/types';
import type { UserPrivate, Performance, PerformanceCategory } from '@/types';
import type { User as FirebaseUser } from 'firebase/auth';
import { cn } from '@/lib/cn';

interface ProfileProps {
  uid: string;
  currentUser: FirebaseUser | null;
  onBack?: () => void;
  onSignOut: () => void;
  currentUserPrivateData?: UserPrivate | null;
  onUpdatePrivate?: (updates: Partial<UserPrivate>) => Promise<void>;
  userPerformances?: Performance[];
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

/** Horizontal performance reel — arrow-navigated to avoid SwipeableShell conflicts */
function PerformanceReel({
  performances,
  onViewPerformance,
}: {
  performances: Performance[];
  onViewPerformance?: (p: Performance) => void;
}) {
  const [offset, setOffset] = useState(0);
  const VISIBLE = 2; // cards visible at once

  const canPrev = offset > 0;
  const canNext = offset + VISIBLE < performances.length;

  if (performances.length === 0) {
    return (
      <div className="rounded-2xl glass py-10 text-center">
        <p className="text-white/30 text-sm">No performances yet</p>
      </div>
    );
  }

  const visible = performances.slice(offset, offset + VISIBLE);

  return (
    <div className="relative">
      {/* Arrow — previous */}
      <button
        onClick={() => setOffset(o => Math.max(0, o - 1))}
        disabled={!canPrev}
        className={cn(
          'absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full glass flex items-center justify-center transition-all',
          canPrev ? 'opacity-100 hover:bg-white/10' : 'opacity-0 pointer-events-none'
        )}
      >
        <ChevronLeft size={16} />
      </button>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-3 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map(p => {
            const accentColor = CATEGORY_COLORS[p.category as PerformanceCategory] ?? '#7A5CFF';
            return (
              <motion.button
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                onClick={() => onViewPerformance?.(p)}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden text-left group"
                style={{ boxShadow: `0 4px 24px ${accentColor}20` }}
              >
                {/* Background */}
                <div className="absolute inset-0 bg-[#0D0D1A]">
                  {p.performerPhoto ? (
                    <img
                      src={p.performerPhoto}
                      alt={p.performerName}
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity"
                      referrerPolicy="no-referrer"
                      draggable={false}
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{
                        background: `radial-gradient(ellipse at 50% 30%, ${accentColor}35 0%, #0D0D1A 70%)`,
                      }}
                    />
                  )}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(to bottom, transparent 30%, rgba(11,11,20,0.95) 100%)',
                    }}
                  />
                </div>

                {/* Voted-out badge */}
                {p.status === 'voted_out' && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-[#FF3B3B]/90 text-white text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full">
                      Voted
                    </span>
                  </div>
                )}

                {/* Info */}
                <div className="absolute bottom-0 inset-x-0 p-3">
                  <Badge category={p.category as PerformanceCategory} className="mb-2 text-[9px]" />
                  <div className="flex items-center gap-2 text-white/50 text-[10px]">
                    <Clock size={9} />
                    <span>{formatDuration(p.duration)}</span>
                    {p.totalEarnings > 0 && (
                      <span style={{ color: '#00FFB2' }}>${p.totalEarnings.toFixed(2)}</span>
                    )}
                  </div>
                  <p className="text-white/30 text-[10px] mt-0.5">
                    {formatDistanceToNow(new Date(p.startTime), { addSuffix: true })}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Arrow — next */}
      <button
        onClick={() => setOffset(o => Math.min(performances.length - VISIBLE, o + 1))}
        disabled={!canNext}
        className={cn(
          'absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full glass flex items-center justify-center transition-all',
          canNext ? 'opacity-100 hover:bg-white/10' : 'opacity-0 pointer-events-none'
        )}
      >
        <ChevronRight size={16} />
      </button>

      {/* Dot indicators */}
      {performances.length > VISIBLE && (
        <div className="flex justify-center gap-1 mt-3">
          {Array.from({ length: Math.ceil(performances.length / VISIBLE) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setOffset(i * VISIBLE)}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: Math.floor(offset / VISIBLE) === i ? 16 : 6,
                background: Math.floor(offset / VISIBLE) === i
                  ? '#7A5CFF'
                  : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Profile({
  uid,
  currentUser,
  onBack,
  onSignOut,
  currentUserPrivateData,
  onUpdatePrivate,
  userPerformances = [],
}: ProfileProps) {
  const { profile, isFollowing, isOwn, follow, unfollow, updateProfile } = useProfile(uid, currentUser);
  const [followLoading, setFollowLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Bio edit state
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [bioSaving, setBioSaving] = useState(false);

  const startBioEdit = () => {
    setBioInput(profile?.bio ?? '');
    setEditingBio(true);
  };

  const saveBio = async () => {
    if (!profile) return;
    setBioSaving(true);
    try {
      await updateProfile({ bio: bioInput.trim() || undefined });
    } finally {
      setBioSaving(false);
      setEditingBio(false);
    }
  };

  const cancelBioEdit = () => {
    setEditingBio(false);
    setBioInput('');
  };

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    try {
      isFollowing ? await unfollow() : await follow();
    } finally {
      setFollowLoading(false);
    }
  };

  // Loading state
  if (!profile) {
    return (
      <div className="h-full bg-midnight flex items-center justify-center">
        <div className="w-8 h-8 rounded-full gradient-bg animate-pulse" />
      </div>
    );
  }

  const stats = [
    { label: 'Shows', value: profile.performanceHistory?.length ?? 0 },
    { label: 'Followers', value: profile.followerCount ?? 0 },
    { label: 'Following', value: profile.followingCount ?? 0 },
  ];

  return (
    <>
      {/*
       * Responsive layout:
       *   Mobile  — full-height scroll column (classic profile)
       *   Desktop — split: sticky sidebar left (profile info) + scrollable right (reel + wallet)
       */}
      <div className="h-full bg-midnight overflow-y-auto overscroll-y-contain scrollbar-hide md:overflow-hidden">
        <div className="md:flex md:h-full">

          {/* ══════════════════════════════════════════════
              LEFT / SIDEBAR — profile identity
          ══════════════════════════════════════════════ */}
          <div className="md:w-80 md:shrink-0 md:h-full md:overflow-y-auto md:scrollbar-hide md:border-r md:border-white/[0.06]">

            {/* Cover gradient */}
            <div className="relative h-40 md:h-48 shrink-0">
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(135deg, #7A5CFF 0%, #FF2D9A 50%, #2DA8FF 100%)',
                  opacity: 0.22,
                }}
              />
              {/* Animated orbs */}
              <div className="absolute top-4 left-8 w-24 h-24 rounded-full opacity-30 animate-blob"
                style={{ background: '#7A5CFF', filter: 'blur(30px)' }} />
              <div className="absolute top-6 right-10 w-20 h-20 rounded-full opacity-20 animate-blob"
                style={{ background: '#FF2D9A', filter: 'blur(30px)', animationDelay: '1.5s' }} />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(to bottom, transparent 50%, #0B0B14 100%)'
              }} />

              {/* Top nav */}
              <div className="absolute top-0 inset-x-0 safe-top pt-4 px-4 flex items-center justify-between z-10">
                {onBack ? (
                  <button
                    onClick={onBack}
                    className="w-9 h-9 rounded-full glass flex items-center justify-center"
                  >
                    <ChevronLeft size={18} />
                  </button>
                ) : <div />}

                {isOwn && (
                  <button
                    onClick={() => setSettingsOpen(true)}
                    className="w-9 h-9 rounded-full glass flex items-center justify-center"
                  >
                    <Settings size={15} className="text-white/60" />
                  </button>
                )}
              </div>

              {/* Avatar */}
              <div className="absolute -bottom-11 left-5 z-10">
                <Avatar src={profile.photoURL} username={profile.username} size="xl" ring />
              </div>
            </div>

            {/* Profile content */}
            <div className="pt-14 px-5 pb-8">
              {/* Name row */}
              <div className="flex items-start justify-between mb-1 gap-3">
                <h1 className="text-2xl font-black leading-tight">{profile.username}</h1>
                {!isOwn && currentUser && (
                  <Button
                    variant={isFollowing ? 'secondary' : 'gradient'}
                    size="sm"
                    loading={followLoading}
                    onClick={handleFollowToggle}
                    className="shrink-0"
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>

              {/* Bio */}
              <div className="mb-4 min-h-[28px]">
                {editingBio ? (
                  <div className="flex items-start gap-2">
                    <textarea
                      autoFocus
                      value={bioInput}
                      onChange={e => setBioInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveBio(); }
                        if (e.key === 'Escape') cancelBioEdit();
                      }}
                      maxLength={120}
                      rows={2}
                      placeholder="Tell the crowd who you are…"
                      className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 outline-none resize-none focus:border-purple/60 transition-colors"
                    />
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={saveBio}
                        disabled={bioSaving}
                        className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center"
                      >
                        <Check size={12} className="text-white" />
                      </button>
                      <button
                        onClick={cancelBioEdit}
                        className="w-7 h-7 rounded-full glass flex items-center justify-center"
                      >
                        <XIcon size={12} className="text-white/60" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    {profile.bio ? (
                      <p className="text-white/50 text-sm leading-relaxed">{profile.bio}</p>
                    ) : isOwn ? (
                      <p className="text-white/20 text-sm italic">Add a bio…</p>
                    ) : null}
                    {isOwn && (
                      <button
                        onClick={startBioEdit}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/10"
                        aria-label="Edit bio"
                      >
                        <Pencil size={13} className="text-white/40" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 mb-6">
                {stats.map(({ label, value }) => (
                  <div key={label} className="text-center md:text-left">
                    <p className="text-xl font-black">{value.toLocaleString()}</p>
                    <p className="text-white/40 text-xs">{label}</p>
                  </div>
                ))}
              </div>

              {/* Wallet — own profile, mobile only (desktop shows in right col) */}
              {isOwn && currentUserPrivateData && onUpdatePrivate && (
                <div className="md:hidden">
                  <WalletWidget privateData={currentUserPrivateData} onUpdatePrivate={onUpdatePrivate} />
                </div>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              RIGHT / CONTENT — performances + wallet
          ══════════════════════════════════════════════ */}
          <div className="flex-1 md:h-full md:overflow-y-auto md:scrollbar-hide px-5 pb-10 md:pt-8">
            {/* Wallet — own profile, desktop only */}
            {isOwn && currentUserPrivateData && onUpdatePrivate && (
              <div className="hidden md:block mb-8">
                <WalletWidget privateData={currentUserPrivateData} onUpdatePrivate={onUpdatePrivate} />
              </div>
            )}

            {/* Performance reel header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">
                Performances
              </p>
              {userPerformances.length > 0 && (
                <p className="text-white/30 text-xs">{userPerformances.length} total</p>
              )}
            </div>

            <PerformanceReel performances={userPerformances} />
          </div>
        </div>
      </div>

      {/* ── Settings sheet ── */}
      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Settings">
        <div className="flex flex-col gap-3">
          <button
            onClick={() => { setSettingsOpen(false); onSignOut(); }}
            className="flex items-center gap-3 w-full p-4 glass rounded-2xl text-[#FF3B3B] hover:bg-[#FF3B3B]/10 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </Modal>
    </>
  );
}
