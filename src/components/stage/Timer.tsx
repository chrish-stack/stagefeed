import { cn } from '@/lib/cn';

interface TimerProps {
  timeLeft: number;
  totalTime?: number;
  className?: string;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function Timer({ timeLeft, totalTime = 60, className }: TimerProps) {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const displayTime = `${pad(mins)}:${pad(secs)}`;

  const isWarning = timeLeft <= 30 && timeLeft > 10;
  const isCritical = timeLeft <= 10;

  const color = isCritical ? '#FF3B3B' : isWarning ? '#FF2D9A' : '#FFFFFF';
  const arcColor = isCritical ? '#FF3B3B' : isWarning ? '#FF2D9A' : '#7A5CFF';

  // SVG arc
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, timeLeft / Math.max(totalTime, 1));
  const dashOffset = circumference * (1 - progress);

  return (
    <div className={cn('flex items-center gap-2', isCritical && 'animate-timer-pulse', className)}>
      {/* Arc progress ring */}
      <svg width="52" height="52" className="shrink-0 -rotate-90">
        {/* Track */}
        <circle cx="26" cy="26" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
        {/* Progress */}
        <circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke={arcColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
        />
      </svg>

      {/* Time display */}
      <span
        className="font-black tabular-nums leading-none"
        style={{
          color,
          fontSize: timeLeft >= 600 ? '1.25rem' : '1.5rem',
          transition: 'color 0.5s',
        }}
      >
        {displayTime}
      </span>
    </div>
  );
}
