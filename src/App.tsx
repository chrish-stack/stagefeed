import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';
import { useStage } from '@/hooks/useStage';
import { useChat } from '@/hooks/useChat';
import { useAgora } from '@/hooks/useAgora';
import { useProfile } from '@/hooks/useProfile';

import { LoginScreen } from '@/components/auth/LoginScreen';
import { SwipeableShell } from '@/components/SwipeableShell';
import { PanelDots } from '@/components/PanelDots';
import { LiveStage } from '@/components/stage/LiveStage';
import { Archive } from '@/components/archive/Archive';
import { Profile } from '@/components/profile/Profile';

import type { UserProfile, UserPrivate, PanelId } from '@/types';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [privateData, setPrivateData] = useState<UserPrivate | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelId>(1);
  const [viewingUid, setViewingUid] = useState<string | null>(null);

  // Core hooks
  const stage = useStage(user, profile);
  const chat = useChat(stage.currentPerformance?.id ?? null, user, profile);
  const agora = useAgora();

  // Profile hook for the backstage panel
  const targetUid = viewingUid ?? user?.uid ?? null;
  const backstageProfile = useProfile(targetUid, user);

  // Auth init
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userRef = doc(db, 'users', u.uid);
        const privateRef = doc(db, 'users_private', u.uid);
        const [userSnap, privateSnap] = await Promise.all([
          getDoc(userRef),
          getDoc(privateRef),
        ]);

        const privDefaults: UserPrivate = { earnings: 0, linkedAccounts: {} };

        if (!userSnap.exists()) {
          const newProfile: UserProfile = {
            uid: u.uid,
            username: u.displayName || `User_${u.uid.slice(0, 5)}`,
            photoURL: u.photoURL || '',
            role: 'user',
            createdAt: new Date().toISOString(),
            followerCount: 0,
            followingCount: 0,
          };
          await setDoc(userRef, newProfile);
          await setDoc(privateRef, privDefaults);
          setProfile(newProfile);
          setPrivateData(privDefaults);
        } else {
          setProfile(userSnap.data() as UserProfile);
          setPrivateData(privateSnap.exists() ? (privateSnap.data() as UserPrivate) : privDefaults);
          if (!privateSnap.exists()) await setDoc(privateRef, privDefaults);
        }
      } else {
        setProfile(null);
        setPrivateData(null);
      }
      setIsAuthReady(true);
    });
    return unsub;
  }, []);

  // Sync profile updates from Firestore to local state
  useEffect(() => {
    if (backstageProfile.profile && targetUid === user?.uid) {
      setProfile(backstageProfile.profile);
    }
  }, [backstageProfile.profile, targetUid, user?.uid]);

  // Agora lifecycle — join/leave when current performance changes
  useEffect(() => {
    if (!stage.currentPerformance) {
      agora.leave();
      return;
    }
    const channelName = stage.currentPerformance.id;
    if (stage.currentPerformance.performerUid === user?.uid) {
      agora.joinAsHost(channelName);
    } else {
      agora.joinAsAudience(channelName);
    }
    return () => { agora.leave(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.currentPerformance?.id, user?.uid]);

  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      console.error('Login failed', e);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignOut = () => auth.signOut();

  const handleViewProfile = (uid: string) => {
    setViewingUid(uid === user?.uid ? null : uid);
    setActivePanel(2);
  };

  const handleBackstageBack = () => {
    setViewingUid(null);
    setActivePanel(1);
  };

  const handleUpdatePrivate = async (updates: Partial<UserPrivate>) => {
    if (!user) return;
    await backstageProfile.updatePrivate(updates);
    setPrivateData(prev => ({ ...prev!, ...updates }));
  };

  // Splash screen
  if (!isAuthReady) {
    return (
      <div className="fixed inset-0 bg-midnight flex items-center justify-center">
        <div className="w-12 h-12 rounded-full gradient-bg animate-pulse glow-purple" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} loading={loginLoading} />;
  }

  return (
    <div className="fixed inset-0 bg-midnight overflow-hidden touch-none select-none">
      <SwipeableShell activePanel={activePanel} onPanelChange={setActivePanel}>
        {/* PANEL 0: Archive */}
        <Archive
          performances={stage.archivePerformances}
          onViewProfile={handleViewProfile}
        />

        {/* PANEL 1: Live Stage */}
        <LiveStage
          performance={stage.currentPerformance}
          globalState={stage.globalState}
          timeLeft={stage.timeLeft}
          queue={stage.queue}
          tips={stage.tips}
          voteCount={stage.voteCount}
          hasVoted={stage.hasVoted}
          isInQueue={stage.isInQueue}
          user={user}
          agora={agora}
          chatMessages={chat.messages}
          chatInput={chat.input}
          onChatInputChange={chat.setInput}
          onChatSend={chat.send}
          onSendTip={stage.sendTip}
          onVoteOut={stage.sendVoteOut}
          onJoinQueue={stage.joinQueue}
          onLeaveQueue={stage.leaveQueue}
          onViewProfile={handleViewProfile}
        />

        {/* PANEL 2: Backstage / Profile */}
        <Profile
          uid={targetUid ?? user.uid}
          currentUser={user}
          onBack={viewingUid ? handleBackstageBack : undefined}
          onSignOut={handleSignOut}
          currentUserPrivateData={viewingUid ? null : privateData}
          onUpdatePrivate={viewingUid ? undefined : handleUpdatePrivate}
          userPerformances={stage.archivePerformances.filter(
            p => p.performerUid === (targetUid ?? user.uid)
          )}
        />
      </SwipeableShell>

      <PanelDots
        activePanel={activePanel}
        isLive={!!stage.currentPerformance}
        onNavigate={setActivePanel}
      />
    </div>
  );
}
