"use client";

import React from "react";
import { PullToRefreshWrapper } from "../functions/pull-to-refresh-wrapper";

type PagePaddingWrapperProps = {
  children: React.ReactNode;
  noPadding?: boolean;
};

export default function PagePaddingWrapper({
  children,
  noPadding = false,
}: PagePaddingWrapperProps) {
  return (
    <div className="flex flex-1 overflow-y-auto min-h-[calc(100vh_-_40px_-_82px)] max-h-[calc(100vh_-_40px_-_82px)] md:min-h-[calc(100vh_-_0px)] md:max-h-[calc(100vh_-_0px)]">
      <PullToRefreshWrapper className="flex flex-col flex-1">
        <div
          className={
            noPadding
              ? "flex flex-1 flex-col"
              : "h-full flex-1 flex-col p-4 md:p-5"
          }
        >
          {children}
        </div>
      </PullToRefreshWrapper>
    </div>
  );
}
