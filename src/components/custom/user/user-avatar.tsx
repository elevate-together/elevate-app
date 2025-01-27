"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EllipsisVertical } from "lucide-react";

type AvatarProps = {
  name: string;
  email: string;
  image: string | undefined;
  icon?: boolean;
  size?: "small" | "large";
  includeEmail?: boolean | null;
};

export default function UserAvatar({
  name,
  email,
  image,
  icon = false,
  size = "large",
  includeEmail = true,
}: AvatarProps) {
  return (
    <div
      className={`flex flex-row items-center ${
        icon ? "justify-between" : "justify-start gap-2"
      }`}
    >
      <Avatar className={`${size == "large" ? "" : "w-8 h-8"}`}>
        <AvatarImage className="" src={image ?? undefined} />
        <AvatarFallback>{name?.at(0) ?? "A"}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-0 items-start">
        <div
          className={`text-sm ${
            includeEmail ? "font-semibold" : "font-normal"
          } p-0 m-0`}
        >
          {name}
        </div>
        {includeEmail && (
          <p className="text-xs font-normal text-muted-foreground p-0 m-0">
            {email}
          </p>
        )}
      </div>
      {icon && <EllipsisVertical width={17} />}
    </div>
  );
}
