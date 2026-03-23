import { cn } from '@/lib/cn';

interface AvatarProps {
  src?: string;
  username?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;   // gradient ring (used for live performer)
  className?: string;
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

const ringPad = {
  xs: 'p-[1.5px]',
  sm: 'p-[2px]',
  md: 'p-[2px]',
  lg: 'p-[2.5px]',
  xl: 'p-[3px]',
};

export function Avatar({ src, username, size = 'md', ring = false, className }: AvatarProps) {
  const initials = username ? username.slice(0, 2).toUpperCase() : '??';

  const inner = (
    <div className={cn('rounded-full overflow-hidden bg-white/10 flex items-center justify-center shrink-0', sizeMap[size], ring && 'w-full h-full')}>
      {src ? (
        <img src={src} alt={username || 'avatar'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <span className="font-bold text-white/70">{initials}</span>
      )}
    </div>
  );

  if (ring) {
    return (
      <div className={cn('rounded-full gradient-ring shrink-0', ringPad[size], sizeMap[size], className)}>
        {inner}
      </div>
    );
  }

  return (
    <div className={cn('rounded-full overflow-hidden bg-white/10 flex items-center justify-center shrink-0', sizeMap[size], className)}>
      {src ? (
        <img src={src} alt={username || 'avatar'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <span className="font-bold text-white/70">{initials}</span>
      )}
    </div>
  );
}
