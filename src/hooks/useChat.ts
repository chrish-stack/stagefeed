import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, onSnapshot, query, orderBy, limit,
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import type { ChatMessage, UserProfile } from '@/types';

const MAX_MESSAGES = 40;

export function useChat(
  performanceId: string | null,
  user: FirebaseUser | null,
  profile: UserProfile | null,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Clean up previous listener
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

    if (!performanceId) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'performances', performanceId, 'chat'),
      orderBy('timestamp', 'desc'),
      limit(MAX_MESSAGES)
    );

    unsubRef.current = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)).reverse());
    });

    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, [performanceId]);

  const send = async () => {
    const text = input.trim();
    if (!text || !performanceId || !user || sending) return;

    setSending(true);
    setInput('');

    try {
      await addDoc(collection(db, 'performances', performanceId, 'chat'), {
        performanceId,
        senderUid: user.uid,
        senderName: profile?.username || 'Guest',
        senderPhoto: profile?.photoURL || '',
        message: text,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Chat send failed', e);
      setInput(text); // restore on error
    } finally {
      setSending(false);
    }
  };

  return { messages, input, setInput, send, sending };
}
