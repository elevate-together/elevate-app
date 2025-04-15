"use client";

import { useEffect } from "react";
import PullToRefresh from "pulltorefreshjs";
import { useRouter } from "next/navigation";

export function PullToRefreshWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isStandAlone =
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    if (isStandAlone) {
      PullToRefresh.init({
        mainElement: ".scrollable-container",
        onRefresh() {
          // Check if the container is at the top (scrollTop === 0)
          const container = document.querySelector(".scrollable-container");

          if (container && container.scrollTop === 0) {
            router.refresh(); // Only refresh if at the top
          }
        },
      });

      return () => {
        PullToRefresh.destroyAll();
      };
    }
  }, [router, isStandAlone]);

  return <div className="scrollable-container">{children}</div>;
}
