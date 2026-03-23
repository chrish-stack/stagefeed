import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface LoginScreenProps {
  onLogin: () => void;
  loading?: boolean;
}

const PREVIEW_ITEMS = [
  { emoji: '🎤', label: 'Stand-Up' },
  { emoji: '💃', label: 'Dance'    },
  { emoji: '🎸', label: 'Music'    },
  { emoji: '🎭', label: 'Theatre'  },
];

export function LoginScreen({ onLogin, loading }: LoginScreenProps) {
  return (
    <div className="fixed inset-0 bg-midnight flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] rounded-full animate-blob opacity-20"
          style={{ background: '#7A5CFF', filter: 'blur(100px)', top: '-15%', left: '-15%' }}
        />
        <div
          className="absolute w-96 h-96 rounded-full animate-blob animation-delay-2000 opacity-15"
          style={{ background: '#FF2D9A', filter: 'blur(80px)', top: '40%', right: '-10%' }}
        />
        <div
          className="absolute w-80 h-80 rounded-full animate-blob animation-delay-4000 opacity-12"
          style={{ background: '#2DA8FF', filter: 'blur(90px)', bottom: '-10%', left: '25%' }}
        />
      </div>

      {/* Content card */}
      <motion.div
        className="relative z-10 flex flex-col items-center px-8 text-center max-w-sm w-full"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <motion.div
          className="relative mb-6"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 20 }}
        >
          <img
            src="/icon.png"
            alt="StageFeed"
            className="w-20 h-20 rounded-3xl object-contain"
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Fallback / glow behind logo */}
          <div
            className="absolute inset-0 rounded-3xl -z-10"
            style={{
              background: 'linear-gradient(135deg, #7A5CFF, #FF2D9A)',
              boxShadow: '0 0 40px rgba(122,92,255,0.5), 0 0 80px rgba(255,45,154,0.25)',
            }}
          />
        </motion.div>

        {/* Brand */}
        <h1 className="text-5xl font-black gradient-text mb-2 tracking-tight">StageFeed</h1>
        <p className="text-white/45 text-base mb-10 leading-relaxed">
          Live performance, every moment.
        </p>

        {/* Feature preview strip */}
        <div className="flex gap-2.5 mb-10 w-full">
          {PREVIEW_ITEMS.map(({ emoji, label }, i) => (
            <motion.div
              key={label}
              className="flex-1 rounded-2xl flex flex-col items-center justify-center gap-1.5 py-5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + i * 0.07, type: 'spring', stiffness: 300 }}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-white/40 text-[10px] font-semibold">{label}</span>
            </motion.div>
          ))}
        </div>

        {/* Google sign-in */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Button
            variant="gradient"
            size="lg"
            className="w-full text-base font-bold"
            onClick={onLogin}
            loading={loading}
          >
            <GoogleIcon />
            Continue with Google
          </Button>
        </motion.div>

        <motion.p
          className="text-white/20 text-xs mt-6 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          By continuing you agree to our Terms of Service.
          <br />18+ only · Live content may be mature
        </motion.p>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
      <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
