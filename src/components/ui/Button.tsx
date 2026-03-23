import { cn } from '@/lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gradient' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:pointer-events-none select-none';

  const variants = {
    primary: 'bg-white text-black hover:bg-white/90',
    gradient:
      'text-white hover:opacity-90 glow-purple',
    secondary: 'bg-white/10 text-white hover:bg-white/15 border border-white/10',
    ghost: 'text-white/60 hover:text-white hover:bg-white/8',
    danger: 'bg-[#FF3B3B]/15 text-[#FF3B3B] border border-[#FF3B3B]/30 hover:bg-[#FF3B3B] hover:text-white',
    outline: 'border border-white/20 text-white hover:bg-white/8',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      style={variant === 'gradient' ? { background: 'var(--gradient-stage)' } : undefined}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
