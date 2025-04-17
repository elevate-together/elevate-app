"use client";

import { useEffect, useRef } from "react";
import PullToRefresh from "pulltorefreshjs";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function PullToRefreshWrapper({ children, className }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const shouldRefreshRef = useRef(true);

  useEffect(() => {
    const container = containerRef.current;

    const handleTouchStart = (ev: TouchEvent) => {
      let el = ev.target as HTMLElement | null;

      shouldRefreshRef.current = true;

      while (el && el !== document.body) {
        if (el.scrollTop > 0) {
          shouldRefreshRef.current = false;
          break;
        }

        // Optional: prevent PTR if interacting with modal/dialog
        if (el.getAttribute("role") === "dialog") {
          shouldRefreshRef.current = false;
          break;
        }

        el = el.parentElement;
      }
    };

    const handleTouchEnd = () => {
      shouldRefreshRef.current = true;
    };

    document.body.addEventListener("touchstart", handleTouchStart);
    document.body.addEventListener("touchend", handleTouchEnd);

    if (container) {
      PullToRefresh.init({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mainElement: container as any,
        shouldPullToRefresh: () =>
          container.scrollTop === 0 && shouldRefreshRef.current,
        onRefresh: () => {
          router.refresh();
        },
      });
    }

    return () => {
      PullToRefresh.destroyAll();
      document.body.removeEventListener("touchstart", handleTouchStart);
      document.body.removeEventListener("touchend", handleTouchEnd);
    };
  }, [router, pathname]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
