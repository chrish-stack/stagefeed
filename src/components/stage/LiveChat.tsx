import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import type { ChatMessage } from '@/types';

interface LiveChatProps {
  messages: ChatMessage[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  performerUid?: string;
  isLoggedIn: boolean;
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
    <div className="flex flex-col" style={{ maxWidth: '70%' }}>
      {/* Messages — TikTok style: just name + text, float up */}
      <div className="flex flex-col gap-1.5 overflow-hidden max-h-44 mb-2.5">
        <AnimatePresence initial={false}>
          {messages.slice(-10).map(msg => {
            const isPerformer = msg.senderUid === performerUid;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
                className="flex items-baseline gap-1.5 flex-wrap"
              >
                <span
                  className="text-xs font-black shrink-0 leading-snug"
                  style={{ color: isPerformer ? '#7A5CFF' : '#FF2D9A' }}
                >
                  {msg.senderName}
                </span>
                <span
                  className="text-sm leading-snug break-words"
                  style={{
                    color: 'rgba(255,255,255,0.9)',
                    textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                  }}
                >
                  {msg.message}
                </span>
              </motion.div>
            );
          })}
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
            placeholder="Add a comment…"
            maxLength={200}
            className="flex-1 rounded-full px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none min-w-0"
            style={{
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          />
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onSend}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center shrink-0 disabled:opacity-30 transition-opacity"
          >
            <Send size={14} className="text-white ml-0.5" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
