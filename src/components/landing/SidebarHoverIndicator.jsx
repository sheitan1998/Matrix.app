import { useLayoutEffect, useRef } from "react";

export default function SidebarHoverIndicator({ containerRef, activeKey }) {
  const indicatorRef = useRef(null);
  useLayoutEffect(() => {
    const root = containerRef.current;
    const indicator = indicatorRef.current;
    const selector = "[data-sidebar-link], [data-sidebar-translation] > div > button";
    let hovered = null;
    let focused = null;
    const find = node => node instanceof Element ? node.closest(selector) : null;
    const update = () => {
      const target = hovered || (focused?.matches(":focus-visible") ? focused : null) || root.querySelector('[aria-current="page"]');
      if (!target) { indicator.style.opacity = "0"; return; }
      const bounds = root.getBoundingClientRect();
      const parent = target.offsetParent;
      const origin = parent.getBoundingClientRect();
      const x = origin.left - bounds.left + target.offsetLeft - parent.scrollLeft;
      const y = origin.top - bounds.top + target.offsetTop - parent.scrollTop;
      const viewport = target.closest("nav")?.getBoundingClientRect() || bounds;
      Object.assign(indicator.style, {
        transform: `translate3d(${x}px, ${y}px, 0)`,
        width: `${target.offsetWidth}px`, height: `${target.offsetHeight}px`,
        borderRadius: window.getComputedStyle(target).borderRadius,
        opacity: bounds.top + y >= viewport.top && bounds.top + y + target.offsetHeight <= viewport.bottom ? "1" : "0",
      });
    };
    const over = event => { hovered = find(event.target); update(); };
    const leave = event => { if (event.target === root) { hovered = null; update(); } };
    const focus = event => { focused = find(event.target); update(); };
    const blur = event => { focused = find(event.relatedTarget); update(); };
    const events = { pointerover: over, pointerleave: leave, focusin: focus, focusout: blur, scroll: update };
    Object.entries(events).forEach(([name, handler]) => root.addEventListener(name, handler, true));
    const observer = new ResizeObserver(update);
    observer.observe(root);
    root.querySelectorAll("nav").forEach(element => observer.observe(element));
    window.addEventListener("resize", update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      Object.entries(events).forEach(([name, handler]) => root.removeEventListener(name, handler, true));
    };
  }, [containerRef, activeKey]);
  return <div ref={indicatorRef} className="landing-sidebar-neon__indicator" aria-hidden="true" />;
}