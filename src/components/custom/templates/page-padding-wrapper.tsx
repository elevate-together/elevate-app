"use client";

import React from "react";
import { PullToRefreshWrapper } from "../functions/pull-to-refresh-wrapper";

type PagePaddingWrapperProps = {
  children: React.ReactNode;
};

export default function PagePaddingWrapper({
  children,
}: PagePaddingWrapperProps) {
  return (
    <div className="flex-1 overflow-y-auto max-h-[calc(100vh_-_40px_-_82px)] md:max-h-[calc(100vh_-_0px)]">
      <PullToRefreshWrapper>
        <div className="p-4 md:p-5">{children}</div>
      </PullToRefreshWrapper>
    </div>
  );
}
