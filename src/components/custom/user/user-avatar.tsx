"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EllipsisVertical } from "lucide-react";
import { UserBasics } from "@/lib/utils";

type AvatarProps = {
  user: UserBasics;
  icon?: boolean;
  size?: "xsmall" | "small" | "medium" | "large";
  includeEmail?: boolean;
  boldName?: boolean;
  secondLine?: React.ReactNode;
  excludeLink?: boolean;
};

export default function UserAvatar({
  user,
  icon = false,
  size = "medium",
  includeEmail = false,
  boldName = false,
  secondLine = "",
  excludeLink = false,
}: AvatarProps) {
  const sizeClasses = {
    xsmall: "w-5 h-5 text-xs",
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
        <AvatarImage src={user.image ?? undefined} />
        <AvatarFallback>
          {user.name?.charAt(0).toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col leading-tight">
        <span
          className={`m-0 p-0 ${nameFontWeight} ${
            size === "large" ? "text-xl" : "text-sm"
          }`}
        >
          {user.name}
        </span>

        {includeEmail ? (
          <p
            className={`m-0 p-0 ${emailTextSize} font-normal text-muted-foreground`}
          >
            {user.email}
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
      {excludeLink ? (
        AvatarContent
      ) : (
        <Link href={`/user/${user.id}`} className="hover:underline">
          {AvatarContent}
        </Link>
      )}

      {icon && <EllipsisVertical width={17} />}
    </div>
  );
}
