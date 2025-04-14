// components/PullToRefreshWrapper.tsx
"use client";

import { useEffect } from "react";
import PullToRefresh from "pulltorefreshjs";

export function PullToRefreshWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;

    if (standalone) {
      PullToRefresh.init({
        mainElement: "body", // or a specific container like "#scroll-container"
        onRefresh() {
          window.location.reload(); // or trigger your own data refetch
        },
      });
    }
  }, []);

  return <>{children}</>;
}
