import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

// Eases a 0–1 progress value up to its target so a scene visibly grows into place,
// and reports while it is still travelling so the watering effects can play.
export function useGrowth(target, { duration = 2100, delay = 0 } = {}) {
  const still = prefersReducedMotion();
  const [value, setValue] = useState(still ? target : 0);
  const [growing, setGrowing] = useState(!still && target > 0);
  const origin = useRef(still ? target : 0);

  useEffect(() => {
    if (still) { origin.current = target; setValue(target); setGrowing(false); return; }
    const from = origin.current;
    if (from === target) { setGrowing(false); return; }

    let frame = 0;
    let timer = 0;
    setGrowing(true);
    const run = (start) => (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setValue(from + (target - from) * eased);
      if (t < 1) { frame = requestAnimationFrame(run(start)); return; }
      origin.current = target;
      setGrowing(false);
    };
    timer = setTimeout(() => { frame = requestAnimationFrame((now) => run(now)(now)); }, delay);
    return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
  }, [target, duration, delay, still]);

  return [value, growing];
}
