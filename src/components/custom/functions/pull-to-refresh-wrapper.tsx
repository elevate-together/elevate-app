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
        mainElement: "body",
        onRefresh() {
          router.refresh();
        },
      });
    }

    return () => {
      PullToRefresh.destroyAll(); // always good to clean up
    };
  }, [router, isStandAlone]);

  return <>{children}</>;
}
