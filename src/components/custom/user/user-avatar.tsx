"use client";

import Link from "next/link";
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
  profileUrl?: string; 
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
  profileUrl,
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

  const AvatarContent = (
    <div className="flex items-center gap-2">
      <Avatar className={avatarSizeClass}>
        <AvatarImage src={image ?? undefined} />
        <AvatarFallback>{name?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col leading-tight">
        <span
          className={`m-0 p-0 ${nameFontWeight} ${
            size === "large" ? "text-xl" : "text-sm"
          }`}
        >
          {name}
        </span>

        {includeEmail ? (
          <p
            className={`m-0 p-0 ${emailTextSize} font-normal text-muted-foreground`}
          >
            {email}
          </p>
        ) : secondLine ? (
          <p
            className={`m-0 p-0 ${emailTextSize} font-normal text-muted-foreground`}
          >
            {secondLine}
          </p>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-between">
      {profileUrl ? (
        <Link href={profileUrl} className="hover:underline">
          {AvatarContent}
        </Link>
      ) : (
        AvatarContent
      )}

      {icon && <EllipsisVertical width={17} />}
    </div>
  );
}
