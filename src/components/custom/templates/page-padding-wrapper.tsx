"use client";

import React from "react";

type PagePaddingWrapperProps = {
  children: React.ReactNode;
};

export default function PagePaddingWrapper({
  children,
}: PagePaddingWrapperProps) {
  return <div className="p-3 md:p-3">{children}</div>;
}
