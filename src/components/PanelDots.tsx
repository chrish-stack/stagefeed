import { cn } from '@/lib/cn';
import type { PanelId } from '@/types';

interface PanelDotsProps {
  activePanel: PanelId;
  isLive?: boolean;
  onNavigate: (panel: PanelId) => void;
}

const LABELS = ['History', 'Stage', 'Backstage'];

export function PanelDots({ activePanel, isLive, onNavigate }: PanelDotsProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 flex items-center justify-center gap-3 pb-5 safe-bottom pointer-events-none">
      {([0, 1, 2] as PanelId[]).map(panel => {
        const isActive = panel === activePanel;
        const isStage = panel === 1;

        return (
          <button
            key={panel}
            onClick={() => onNavigate(panel)}
            className="pointer-events-auto flex flex-col items-center gap-1 transition-all"
            title={LABELS[panel]}
          >
            <span
              className={cn(
                'rounded-full transition-all duration-300',
                isActive ? 'w-6 h-2' : 'w-2 h-2 opacity-40 hover:opacity-60',
              )}
              style={{
                background: isActive
                  ? isStage && isLive
                    ? 'var(--gradient-stage)'
                    : '#FFFFFF'
                  : 'rgba(255,255,255,0.6)',
                boxShadow: isActive && isStage && isLive
                  ? '0 0 10px rgba(122,92,255,0.6)'
                  : undefined,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
