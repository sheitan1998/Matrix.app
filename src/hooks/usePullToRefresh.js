import { useEffect, useRef, useState } from "react";

/**
 * usePullToRefresh
 * Attaches touch listeners to a scrollable container ref.
 * Calls `onRefresh` when the user pulls down past `threshold` px from the top.
 */
export default function usePullToRefresh({ onRefresh, threshold = 72, containerRef }) {
  const [pulling, setPulling] = useState(false);
  const [pullY, setPullY] = useState(0);
  const startY = useRef(null);
  const isPulling = useRef(false);

  useEffect(() => {
    const el = containerRef?.current ?? window;
    const getScrollTop = () =>
      containerRef?.current ? containerRef.current.scrollTop : window.scrollY;

    const onTouchStart = (e) => {
      if (getScrollTop() > 2) return; // only at top
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    };

    const onTouchMove = (e) => {
      if (!isPulling.current || startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) { isPulling.current = false; return; }
      setPulling(true);
      setPullY(Math.min(dy, threshold * 1.5));
    };

    const onTouchEnd = async () => {
      if (isPulling.current && pullY >= threshold) {
        await onRefresh();
      }
      isPulling.current = false;
      startY.current = null;
      setPulling(false);
      setPullY(0);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [onRefresh, threshold, pullY, containerRef]);

  return { pulling, pullY };
}