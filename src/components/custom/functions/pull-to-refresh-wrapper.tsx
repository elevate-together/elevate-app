"use client";

import { useEffect, useRef } from "react";
import PullToRefresh from "pulltorefreshjs";
import { useRouter } from "next/navigation";

export function PullToRefreshWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const isStandAlone =
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    const el = containerRef.current;

    if (isStandAlone && el) {
      PullToRefresh.init({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mainElement: el as any,
        shouldPullToRefresh: () => {
          return el.scrollTop === 0;
        },
        distThreshold: 60,
        distMax: 80,
        onRefresh: () => {
          router.refresh();
        },
      });

      return () => {
        PullToRefresh.destroyAll();
      };
    }
  }, [router, isStandAlone]);

  return (
    <div
      ref={containerRef}
      className="max-h-[calc(100vh-142px)] md:max-h-[100vh] flex-1 overflow-auto" //max-h-[calc(100vh-142px)] md:max-h-[100vh]
    >
      {children}
    </div>
  );
}
