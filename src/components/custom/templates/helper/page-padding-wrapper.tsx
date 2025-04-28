"use client";

import React from "react";
import { PullToRefreshWrapper } from "@/components/custom/templates/helper/pull-to-refresh-wrapper";
import PageHeightDiv from "@/components/custom/templates/helper/page-height-div";

type PagePaddingWrapperProps = {
  children: React.ReactNode;
  noPadding?: boolean;
};

export default function PagePaddingWrapper({
  children,
  noPadding = false,
}: PagePaddingWrapperProps) {
  return (
    <PageHeightDiv>
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
    </PageHeightDiv>
  );
}
