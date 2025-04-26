"use client";

import React from "react";

type NoDataDisplayProps = {
  title: string;
  icon: React.ElementType;
  subtitle?: string;
  className?: string;
};

export default function NoDataDisplay({
  title,
  icon: Icon,
  subtitle = "",
  className = "",
}: NoDataDisplayProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center flex-1 text-center space-y-4 h-full px-4 mb-10 ${className}`}
    >
      <Icon className="w-12 h-12 text-muted-foreground" />
      <div className="max-w-sm">
        <p className="text-lg font-semibold text-muted-foreground">{title}</p>
        {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
}
