"use client";

import { useEffect, useRef } from "react";
import PullToRefresh from "pulltorefreshjs";
import { usePathname, useRouter } from "next/navigation";

export function PullToRefreshWrapper({
  children,
  className,
  include = false,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  include?: boolean;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isStandAlone =
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches;

  const toInclude = include
    ? true
    : pathname !== "/" && !pathname.startsWith("/requests/");

  useEffect(() => {
    const el = containerRef.current;

    if (isStandAlone && toInclude && el) {
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
  }, [router, isStandAlone, pathname, toInclude]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
