"use client";

import React from "react";

type PagePaddingWrapperProps = {
  children: React.ReactNode;
};

export default function PagePaddingWrapper({
  children,
}: PagePaddingWrapperProps) {
  return <div className="p-2 md:p-4">{children}</div>;
}
