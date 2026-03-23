import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface LoginScreenProps {
  onLogin: () => void;
  loading?: boolean;
}

export function LoginScreen({ onLogin, loading }: LoginScreenProps) {
  return (
    <div className="fixed inset-0 bg-midnight flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute w-80 h-80 rounded-full opacity-25 animate-blob"
          style={{ background: '#7A5CFF', filter: 'blur(80px)', top: '-10%', left: '-10%' }}
        />
        <div
          className="absolute w-72 h-72 rounded-full opacity-20 animate-blob animation-delay-2000"
          style={{ background: '#FF2D9A', filter: 'blur(80px)', top: '30%', right: '-10%' }}
        />
        <div
          className="absolute w-64 h-64 rounded-full opacity-15 animate-blob animation-delay-4000"
          style={{ background: '#2DA8FF', filter: 'blur(80px)', bottom: '-5%', left: '30%' }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center px-8 text-center max-w-sm w-full"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo / Icon */}
        <motion.div
          className="w-20 h-20 rounded-3xl gradient-bg mb-6 flex items-center justify-center shadow-2xl glow-purple"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="14" stroke="white" strokeWidth="2.5" />
            <circle cx="20" cy="20" r="6" fill="white" opacity="0.9" />
            <path d="M20 6 L20 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M20 38 L20 34" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M6 20 L2 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M38 20 L34 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Brand name */}
        <h1 className="text-5xl font-black gradient-text mb-2 tracking-tight">
          StageFeed
        </h1>
        <p className="text-white/50 text-base mb-10">
          Live performance, every moment.
        </p>

        {/* Preview cards */}
        <div className="flex gap-3 mb-10 w-full justify-center">
          {['🎤', '💃', '🎸'].map((emoji, i) => (
            <motion.div
              key={i}
              className="glass rounded-2xl flex-1 h-24 flex flex-col items-center justify-center gap-1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-white/40 text-xs">Live Now</span>
            </motion.div>
          ))}
        </div>

        {/* Sign-in CTA */}
        <Button
          variant="gradient"
          size="lg"
          className="w-full text-base font-bold"
          onClick={onLogin}
          loading={loading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0">
            <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>

        <p className="text-white/25 text-xs mt-6 leading-relaxed">
          By continuing you agree to our Terms of Service.<br />
          18+ only. Live performances may contain mature content.
        </p>
      </motion.div>
    </div>
  );
}
