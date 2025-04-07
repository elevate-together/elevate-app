"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EllipsisVertical } from "lucide-react";

type AvatarProps = {
  name: string;
  email: string;
  image?: string;
  icon?: boolean;
  size?: "small" | "medium" | "large";
  includeEmail?: boolean;
  boldName?: boolean;
  secondLine?: React.ReactNode;
};

export default function UserAvatar({
  name,
  email,
  image,
  icon = false,
  size = "medium",
  includeEmail = false,
  boldName = false,
  secondLine = "",
}: AvatarProps) {
  const sizeClasses = {
    small: "w-8 h-8 text-xs",
    medium: "w-9 h-9 text-sm",
    large: "w-11 h-11 text-xl",
  };

  const avatarSizeClass = sizeClasses[size];
  const nameFontWeight =
    boldName || includeEmail ? "font-semibold" : "font-normal";
  const emailTextSize = size === "large" ? "text-sm" : "text-xs";

  return (
    <div className={"flex flex-row items-center justify-between"}>
      <div className={"flex flex-row items-center justify-start gap-2"}>
        <Avatar className={avatarSizeClass}>
          <AvatarImage src={image ?? undefined} />
          <AvatarFallback>
            {name?.charAt(0).toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col items-start gap-0 leading-tight">
          <div
            className={`p-0 m-0 ${nameFontWeight} ${
              size === "large" ? "text-xl" : "text-sm"
            }`}
          >
            {name}
          </div>
          {includeEmail && (
            <p
              className={`p-0 m-0 ${emailTextSize} font-normal text-muted-foreground`}
            >
              {email}
            </p>
          )}
          {secondLine && !includeEmail && (
            <p
              className={`p-0 m-0 ${emailTextSize} font-normal text-muted-foreground`}
            >
              {secondLine}
            </p>
          )}
        </div>
      </div>

      {icon && <EllipsisVertical width={17} />}
    </div>
  );
}
