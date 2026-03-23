import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, doc, onSnapshot, setDoc, updateDoc, addDoc,
  query, orderBy, limit, getDoc, deleteDoc, increment,
  getDocs, where, runTransaction,
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import type {
  UserProfile, GlobalState, Performance, QueueEntry,
  Tip, PerformanceCategory,
} from '@/types';

export interface StageState {
  globalState: GlobalState | null;
  currentPerformance: Performance | null;
  queue: QueueEntry[];
  archivePerformances: Performance[];
  timeLeft: number;
  tips: Tip[];
  voteCount: number;
  hasVoted: boolean;
  isInQueue: boolean;
  joinQueue: (category: PerformanceCategory) => Promise<void>;
  leaveQueue: () => Promise<void>;
  sendTip: (amount: number) => Promise<void>;
  sendVoteOut: () => Promise<void>;
  endPerformance: (outcome?: 'timer_ended' | 'voted_out') => Promise<void>;
}

export function useStage(user: FirebaseUser | null, profile: UserProfile | null): StageState {
  const [globalState, setGlobalState] = useState<GlobalState | null>(null);
  const [currentPerformance, setCurrentPerformance] = useState<Performance | null>(null);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [archivePerformances, setArchivePerformances] = useState<Performance[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tips, setTips] = useState<Tip[]>([]);
  const [voteCount, setVoteCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isInQueue, setIsInQueue] = useState(false);

  // Refs to latest values for use inside intervals/callbacks
  const currentPerfRef = useRef<Performance | null>(null);
  const globalStateRef = useRef<GlobalState | null>(null);
  const tipsRef = useRef<Tip[]>([]);
  const chatCountRef = useRef(0);
  const endingRef = useRef(false);

  currentPerfRef.current = currentPerformance;
  globalStateRef.current = globalState;
  tipsRef.current = tips;

  // Global state + queue + archive listeners
  useEffect(() => {
    const unsubGlobal = onSnapshot(doc(db, 'global', 'state'), (snap) => {
      if (snap.exists()) setGlobalState(snap.data() as GlobalState);
      else setGlobalState({ currentPerformanceId: null, stageEndTime: null, activeViewers: 0 });
    });

    const unsubQueue = onSnapshot(
      query(collection(db, 'queue'), orderBy('joinedAt', 'asc')),
      (snap) => {
        const entries = snap.docs.map(d => d.data() as QueueEntry);
        setQueue(entries);
        if (user) setIsInQueue(entries.some(e => e.uid === user.uid));
      }
    );

    const unsubArchive = onSnapshot(
      query(
        collection(db, 'performances'),
        where('status', 'in', ['completed', 'voted_out']),
        orderBy('startTime', 'desc'),
        limit(50)
      ),
      (snap) => {
        setArchivePerformances(snap.docs.map(d => d.data() as Performance).reverse());
      }
    );

    return () => { unsubGlobal(); unsubQueue(); unsubArchive(); };
  }, [user]);

  // Current performance + tips + vote listeners
  useEffect(() => {
    if (!globalState?.currentPerformanceId) {
      setCurrentPerformance(null);
      setTips([]);
      setVoteCount(0);
      endingRef.current = false;
      return;
    }

    const perfId = globalState.currentPerformanceId;

    // Check if already voted this performance
    const voted = localStorage.getItem(`voted_${perfId}`);
    setHasVoted(!!voted);

    const unsubPerf = onSnapshot(doc(db, 'performances', perfId), (snap) => {
      if (snap.exists()) setCurrentPerformance(snap.data() as Performance);
    });

    const unsubTips = onSnapshot(
      query(collection(db, 'performances', perfId, 'tips'), orderBy('timestamp', 'desc'), limit(10)),
      (snap) => {
        setTips(snap.docs.map(d => ({ id: d.id, ...d.data() } as Tip)));
      }
    );

    const unsubVotes = onSnapshot(
      collection(db, 'performances', perfId, 'votes'),
      (snap) => setVoteCount(snap.size)
    );

    return () => { unsubPerf(); unsubTips(); unsubVotes(); };
  }, [globalState?.currentPerformanceId]);

  // Timer countdown
  useEffect(() => {
    if (!globalState?.stageEndTime) { setTimeLeft(0); return; }

    const tick = () => {
      const end = new Date(globalState.stageEndTime!).getTime();
      const diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setTimeLeft(diff);

      if (diff <= 0 && currentPerfRef.current?.status === 'active' && !endingRef.current) {
        endingRef.current = true;
        endPerformance('timer_ended').catch(console.error);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalState?.stageEndTime]);

  const endPerformance = async (outcome: 'timer_ended' | 'voted_out' = 'timer_ended') => {
    const perf = currentPerfRef.current;
    if (!perf || perf.status !== 'active') return;

    try {
      const queueSnap = await getDocs(
        query(collection(db, 'queue'), orderBy('joinedAt', 'asc'), limit(1))
      );
      const nextEntry = !queueSnap.empty ? (queueSnap.docs[0].data() as QueueEntry) : null;
      const nextEntryRef = !queueSnap.empty ? queueSnap.docs[0].ref : null;

      const finalDuration = Math.floor(
        (Date.now() - new Date(perf.startTime).getTime()) / 1000
      );

      await runTransaction(db, async (tx) => {
        const perfRef = doc(db, 'performances', perf.id);
        const globalRef = doc(db, 'global', 'state');
        const userRef = doc(db, 'users', perf.performerUid);

        const [globalDoc, userDoc] = await Promise.all([
          tx.get(globalRef),
          tx.get(userRef),
        ]);

        // Only end if still active (guard against double-fire)
        const currentData = await tx.get(perfRef);
        if (currentData.exists() && currentData.data().status !== 'active') return;

        tx.update(perfRef, {
          status: outcome === 'voted_out' ? 'voted_out' : 'completed',
          endTime: new Date().toISOString(),
          duration: finalDuration,
          outcome,
          tipCount: tipsRef.current.length,
          viewerPeak: globalStateRef.current?.activeViewers || 1,
          chatActivity: chatCountRef.current,
        });

        if (userDoc.exists()) {
          const history: string[] = userDoc.data().performanceHistory || [];
          tx.update(userRef, {
            performanceHistory: [perf.id, ...history].slice(0, 50),
          });
        }

        if (nextEntry && nextEntryRef && globalDoc.exists()) {
          const nextId = `perf_${Date.now()}`;
          const nextPerf: Performance = {
            id: nextId,
            performerUid: nextEntry.uid,
            performerName: nextEntry.username,
            performerPhoto: nextEntry.photoURL,
            category: nextEntry.category,
            startTime: new Date().toISOString(),
            totalEarnings: 0,
            duration: 60,
            status: 'active',
            tipCount: 0,
            viewerPeak: 0,
            chatActivity: 0,
          };
          tx.set(doc(db, 'performances', nextId), nextPerf);
          tx.update(globalRef, {
            currentPerformanceId: nextId,
            stageEndTime: new Date(Date.now() + 60_000).toISOString(),
          });
          tx.delete(nextEntryRef);
        } else {
          tx.update(globalRef, {
            currentPerformanceId: null,
            stageEndTime: null,
          });
        }
      });
    } catch (e) {
      console.error('Performance end failed', e);
      endingRef.current = false;
    }
  };

  const joinQueue = async (category: PerformanceCategory) => {
    if (!user || !profile) return;

    const entry: QueueEntry = {
      uid: user.uid,
      username: profile.username,
      photoURL: profile.photoURL,
      joinedAt: new Date().toISOString(),
      status: 'waiting',
      category,
    };

    await setDoc(doc(db, 'queue', user.uid), entry);

    // If stage is empty, go live immediately
    if (!globalStateRef.current?.currentPerformanceId) {
      const nextId = `perf_${Date.now()}`;
      const nextPerf: Performance = {
        id: nextId,
        performerUid: user.uid,
        performerName: profile.username,
        performerPhoto: profile.photoURL,
        category,
        startTime: new Date().toISOString(),
        totalEarnings: 0,
        duration: 60,
        status: 'active',
        tipCount: 0,
        viewerPeak: 0,
        chatActivity: 0,
      };
      await setDoc(doc(db, 'performances', nextId), nextPerf);
      await setDoc(doc(db, 'global', 'state'), {
        currentPerformanceId: nextId,
        stageEndTime: new Date(Date.now() + 60_000).toISOString(),
        activeViewers: 1,
      });
      await deleteDoc(doc(db, 'queue', user.uid));
    }
  };

  const leaveQueue = async () => {
    if (!user) return;
    await deleteDoc(doc(db, 'queue', user.uid));
    setIsInQueue(false);
  };

  const sendTip = async (amount: number) => {
    if (!user || !currentPerfRef.current) return;
    const perf = currentPerfRef.current;
    const extension = amount * 5;

    await runTransaction(db, async (tx) => {
      const perfRef = doc(db, 'performances', perf.id);
      const globalRef = doc(db, 'global', 'state');
      const privateRef = doc(db, 'users_private', perf.performerUid);
      const tipRef = doc(collection(db, 'performances', perf.id, 'tips'));

      const stateDoc = await tx.get(globalRef);

      tx.set(tipRef, {
        performanceId: perf.id,
        senderUid: user.uid,
        senderName: profile?.username || 'Guest',
        amount,
        extensionSeconds: extension,
        timestamp: new Date().toISOString(),
      });
      tx.update(perfRef, {
        totalEarnings: increment(amount),
        tipCount: increment(1),
      });
      tx.set(privateRef, { earnings: increment(amount) }, { merge: true });

      const currentEnd = stateDoc.exists()
        ? new Date(stateDoc.data().stageEndTime).getTime()
        : Date.now();
      tx.update(globalRef, {
        stageEndTime: new Date(currentEnd + extension * 1000).toISOString(),
      });
    });
  };

  const sendVoteOut = async () => {
    if (!user || !currentPerfRef.current || hasVoted) return;
    const perfId = currentPerfRef.current.id;

    await setDoc(doc(db, 'performances', perfId, 'votes', user.uid), {
      voterUid: user.uid,
      timestamp: new Date().toISOString(),
    });

    localStorage.setItem(`voted_${perfId}`, '1');
    setHasVoted(true);

    // Check threshold after vote
    const votesSnap = await getDocs(collection(db, 'performances', perfId, 'votes'));
    const totalVotes = votesSnap.size;
    const viewers = globalStateRef.current?.activeViewers || 1;
    const threshold = Math.max(2, Math.ceil(viewers * 0.3));

    if (totalVotes >= threshold) {
      endingRef.current = true;
      await endPerformance('voted_out');
    }
  };

  // Track chat count for performance metadata
  useEffect(() => {
    if (!globalState?.currentPerformanceId) { chatCountRef.current = 0; return; }
    const unsubChat = onSnapshot(
      query(
        collection(db, 'performances', globalState.currentPerformanceId, 'chat'),
        orderBy('timestamp', 'desc'),
        limit(1)
      ),
      (snap) => { chatCountRef.current = snap.size; }
    );
    return unsubChat;
  }, [globalState?.currentPerformanceId]);

  // Increment viewer count on mount, decrement on unmount
  useEffect(() => {
    if (!globalState?.currentPerformanceId) return;
    const globalRef = doc(db, 'global', 'state');
    updateDoc(globalRef, { activeViewers: increment(1) }).catch(() => {});
    return () => {
      updateDoc(globalRef, { activeViewers: increment(-1) }).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalState?.currentPerformanceId]);

  return {
    globalState,
    currentPerformance,
    queue,
    archivePerformances,
    timeLeft,
    tips,
    voteCount,
    hasVoted,
    isInQueue,
    joinQueue,
    leaveQueue,
    sendTip,
    sendVoteOut,
    endPerformance,
  };
}
