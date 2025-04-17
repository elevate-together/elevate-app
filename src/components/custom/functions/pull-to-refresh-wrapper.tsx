"use client";

import { useEffect } from "react";
import PullToRefresh from "pulltorefreshjs";
import { usePathname, useRouter } from "next/navigation";

export function PullToRefreshWrapper({
  children,
  className = "",
  scrollClass,
}: {
  children: React.ReactNode;
  className?: string;
  scrollClass: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isStandAlone =
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    if (isStandAlone) {
      PullToRefresh.init({
        mainElement: `.${scrollClass}`,
        triggerElement: `.${scrollClass}`,
        shouldPullToRefresh: () => {
          const el = document.querySelector(`.${scrollClass}`);
          return el ? el.scrollTop === 0 : false;
        },
        onRefresh: () => {
          router.refresh();
        },
      });

      return () => {
        PullToRefresh.destroyAll();
      };
    }
  }, [router, isStandAlone, pathname, scrollClass]);

  return (
    <div className={`${scrollClass} overscroll-contain ${className}`}>
      {children}
    </div>
  );
}
