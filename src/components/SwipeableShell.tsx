import { useEffect, useState } from 'react';
import { motion, useAnimation, type PanInfo } from 'framer-motion';
import type { PanelId } from '@/types';

interface SwipeableShellProps {
  activePanel: PanelId;
  onPanelChange: (panel: PanelId) => void;
  children: [React.ReactNode, React.ReactNode, React.ReactNode];
}

export function SwipeableShell({ activePanel, onPanelChange, children }: SwipeableShellProps) {
  const controls = useAnimation();
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    controls.start({
      x: `-${activePanel * 100}vw`,
      transition: { type: 'spring', stiffness: 400, damping: 35, mass: 0.8 },
    });
  }, [activePanel, controls]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onPanelChange(Math.max(0, activePanel - 1) as PanelId);
      if (e.key === 'ArrowRight') onPanelChange(Math.min(2, activePanel + 1) as PanelId);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activePanel, onPanelChange]);

  const handleDragEnd = (_: unknown, { offset, velocity }: PanInfo) => {
    const swipeThreshold = width * 0.22;
    const velocityThreshold = 400;

    if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
      onPanelChange(Math.min(2, activePanel + 1) as PanelId);
    } else if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
      onPanelChange(Math.max(0, activePanel - 1) as PanelId);
    } else {
      controls.start({
        x: `-${activePanel * 100}vw`,
        transition: { type: 'spring', stiffness: 400, damping: 35 },
      });
    }
  };

  return (
    <motion.div
      className="flex h-full touch-none"
      style={{ width: '300vw' }}
      drag="x"
      dragConstraints={{ left: -2 * width, right: 0 }}
      dragElastic={0.06}
      onDragEnd={handleDragEnd}
      animate={controls}
    >
      {/* Archive — vertical scroll allowed */}
      <div className="w-screen h-full shrink-0 relative overflow-hidden touch-pan-y">
        {children[0]}
      </div>

      {/* Stage — no scroll */}
      <div className="w-screen h-full shrink-0 relative overflow-hidden touch-none">
        {children[1]}
      </div>

      {/* Backstage — vertical scroll allowed */}
      <div className="w-screen h-full shrink-0 relative overflow-hidden touch-pan-y">
        {children[2]}
      </div>
    </motion.div>
  );
}
