"use client";

import { Button } from "@/components/ui";
import {
  Hand,
  HelpingHand,
  Home,
  MonitorSmartphone,
  Package,
  PartyPopper,
  ShieldX,
  Star,
  TriangleAlert,
  Users,
  User,
  CalendarDays,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

type NoDataDisplayProps = {
  title: string;
  icon: IconName;
  subtitle?: string;
  className?: string;
  includeGoBackHome?: boolean;
  redirectButton?: React.ReactNode;
};

export type IconName = keyof typeof icons;

const icons = {
  TriangleAlert,
  ShieldX,
  Users,
  MonitorSmartphone,
  HelpingHand,
  PartyPopper,
  Hand,
  Star,
  Package,
  User,
  CalendarDays,
};

export function NoDataDisplay({
  title,
  icon,
  subtitle = "",
  className = "",
  includeGoBackHome = false,
  redirectButton = null,
}: NoDataDisplayProps) {
  const router = useRouter();
  const IconComponent = icons[icon];

  return (
    <div
      className={`flex flex-col items-center justify-center flex-1 text-center space-y-4 h-full px-4 mb-10 ${className}`}
    >
      {IconComponent && (
        <IconComponent className="w-12 h-12 text-muted-foreground" />
      )}
      <div className="max-w-sm">
        <p className="text-lg font-semibold text-muted-foreground">{title}</p>
        {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      </div>
      {includeGoBackHome ? (
        <Button variant="muted" onClick={() => router.push("/")}>
          <Home />
          Go Back Home
        </Button>
      ) : (
        redirectButton && <div>{redirectButton}</div>
      )}
      {}
    </div>
  );
}
