"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const EDGE_PX = 24;
const MIN_SWIPE_PX = 72;

export function SwipeBackHandler() {
  const router = useRouter();

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let tracking = false;

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      if (t.clientX > EDGE_PX) return;
      startX = t.clientX;
      startY = t.clientY;
      tracking = true;
    }

    function onTouchEnd(e: TouchEvent) {
      if (!tracking || e.changedTouches.length !== 1) {
        tracking = false;
        return;
      }
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = Math.abs(t.clientY - startY);
      tracking = false;

      if (dx >= MIN_SWIPE_PX && dy < 80) {
        if (typeof window !== "undefined" && window.__skufHandleBack?.()) return;
        router.back();
      }
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [router]);

  return null;
}
