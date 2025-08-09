"use client";

import React from "react";

type PageHeightDivProps = {
  children: React.ReactNode;
  addTabs?: boolean;
  className?: string;
};

export function PageHeightDiv({
  children,
  addTabs = false,
  className = "",
}: PageHeightDivProps) {
  const heightClass = addTabs
    ? "min-h-[calc(100vh_-_44px_-_46px_-_82px)] max-h-[calc(100vh_-_44px_-_46px_-_82px)]"
    : "min-h-[calc(100vh_-_44px_-_82px)] max-h-[calc(100vh_-_44px_-_82px)]";

  return (
    <div
      className={`overflow-y-auto ${heightClass} md:min-h-[calc(100vh_-_44px)] md:max-h-[calc(100vh_-_44px)] flex flex-col flex-1 h-full w-full ${className}`}
    >
      {children}
    </div>
  );
}
