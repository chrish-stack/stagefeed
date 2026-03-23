import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot,
  collection, deleteDoc, increment,
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserProfile, UserPrivate } from '@/types';

export function useProfile(targetUid: string | null, currentUser: FirebaseUser | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [privateData, setPrivateData] = useState<UserPrivate | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOwn = !!targetUid && targetUid === currentUser?.uid;

  useEffect(() => {
    if (!targetUid) { setProfile(null); setPrivateData(null); return; }
    setLoading(true);

    const unsubPublic = onSnapshot(doc(db, 'users', targetUid), (snap) => {
      if (snap.exists()) setProfile(snap.data() as UserProfile);
      setLoading(false);
    });

    return unsubPublic;
  }, [targetUid]);

  // Private data — only for own profile
  useEffect(() => {
    if (!isOwn || !targetUid) { setPrivateData(null); return; }

    const unsubPrivate = onSnapshot(doc(db, 'users_private', targetUid), (snap) => {
      if (snap.exists()) setPrivateData(snap.data() as UserPrivate);
    });

    return unsubPrivate;
  }, [targetUid, isOwn]);

  // Check follow status
  useEffect(() => {
    if (!targetUid || !currentUser || isOwn) return;

    getDoc(doc(db, 'users', targetUid, 'followers', currentUser.uid))
      .then(snap => setIsFollowing(snap.exists()))
      .catch(() => {});
  }, [targetUid, currentUser, isOwn]);

  const follow = async () => {
    if (!targetUid || !currentUser || isOwn) return;
    await setDoc(doc(db, 'users', targetUid, 'followers', currentUser.uid), {
      followerUid: currentUser.uid,
      followedAt: new Date().toISOString(),
    });
    await updateDoc(doc(db, 'users', targetUid), { followerCount: increment(1) });
    await updateDoc(doc(db, 'users', currentUser.uid), { followingCount: increment(1) }).catch(() => {});
    setIsFollowing(true);
  };

  const unfollow = async () => {
    if (!targetUid || !currentUser || isOwn) return;
    await deleteDoc(doc(db, 'users', targetUid, 'followers', currentUser.uid));
    await updateDoc(doc(db, 'users', targetUid), { followerCount: increment(-1) });
    await updateDoc(doc(db, 'users', currentUser.uid), { followingCount: increment(-1) }).catch(() => {});
    setIsFollowing(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!targetUid || !isOwn) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateDoc(doc(db, 'users', targetUid), updates as any);
  };

  const updatePrivate = async (updates: Partial<UserPrivate>) => {
    if (!targetUid || !isOwn) return;
    await setDoc(doc(db, 'users_private', targetUid), updates, { merge: true });
  };

  return {
    profile,
    privateData,
    isFollowing,
    isOwn,
    loading,
    follow,
    unfollow,
    updateProfile,
    updatePrivate,
  };
}
