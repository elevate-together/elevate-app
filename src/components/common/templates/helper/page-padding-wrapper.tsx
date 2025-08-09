"use client";

import { PageHeightDiv, PullToRefreshWrapper } from "@/components/common";
import React from "react";

type PagePaddingWrapperProps = {
  children: React.ReactNode;
  noPadding?: boolean;
};

export function PagePaddingWrapper({
  children,
  noPadding = false,
}: PagePaddingWrapperProps) {
  return (
    <PageHeightDiv>
      <PullToRefreshWrapper className="flex flex-col flex-1 w-full">
        <div
          className={
            noPadding
              ? "w-full flex flex-1 flex-col"
              : "w-full h-full flex-1 flex-col p-4 md:p-5"
          }
        >
          {children}
        </div>
      </PullToRefreshWrapper>
    </PageHeightDiv>
  );
}
