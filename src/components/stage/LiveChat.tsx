import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import type { ChatMessage } from '@/types';

interface LiveChatProps {
  messages: ChatMessage[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  performerUid?: string;
  isLoggedIn: boolean;
  onLoginRequest?: () => void;
}

export function LiveChat({
  messages,
  input,
  onInputChange,
  onSend,
  performerUid,
  isLoggedIn,
}: LiveChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex flex-col" style={{ maxWidth: '65%' }}>
      {/* Message list */}
      <div className="flex flex-col gap-1.5 overflow-hidden max-h-52 mb-3">
        <AnimatePresence initial={false}>
          {messages.slice(-12).map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-2"
            >
              <Avatar src={msg.senderPhoto} username={msg.senderName} size="xs" className="shrink-0 mt-0.5" />
              <div
                className="px-3 py-1.5 rounded-2xl rounded-tl-sm text-sm leading-snug glass-dark"
                style={{ maxWidth: '100%' }}
              >
                <span
                  className="font-bold text-xs mr-1"
                  style={{ color: msg.senderUid === performerUid ? '#7A5CFF' : '#FF2D9A' }}
                >
                  {msg.senderName}
                </span>
                <span className="text-white/85 break-words">{msg.message}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {isLoggedIn && (
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say something..."
            maxLength={200}
            className="flex-1 glass-dark rounded-full px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-white/20 min-w-0"
          />
          <button
            onClick={onSend}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center shrink-0 disabled:opacity-30 transition-opacity active:scale-90"
          >
            <Send size={14} className="text-white ml-0.5" />
          </button>
        </div>
      )}
    </div>
  );
}
