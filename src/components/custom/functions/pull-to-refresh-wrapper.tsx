"use client";

import { useEffect, useRef } from "react";
import PullToRefresh from "pulltorefreshjs";
import { usePathname, useRouter } from "next/navigation";

export function PullToRefreshWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = containerRef.current;

    if (el) {
      PullToRefresh.init({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mainElement: el as any,
        shouldPullToRefresh: () => {
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
  }, [router, pathname]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
