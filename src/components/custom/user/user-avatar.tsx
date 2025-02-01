"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EllipsisVertical } from "lucide-react";

type AvatarProps = {
  name: string;
  email: string;
  image: string | undefined;
  icon?: boolean;
  size?: "small" | "medium" | "large";
  includeEmail?: boolean;
  boldName?: boolean;
};

export default function UserAvatar({
  name,
  email,
  image,
  icon = false,
  size = "medium",
  includeEmail = true,
  boldName = false,
}: AvatarProps) {
  return (
    <div
      className={`flex flex-row items-center ${
        icon ? "justify-between" : "justify-start gap-2"
      }`}
    >
      <Avatar
        className={`${
          size === "medium" ? "" : size === "large" ? "w-11 h-11" : "w-8 h-8"
        }`}
      >
        <AvatarImage className="" src={image ?? undefined} />
        <AvatarFallback>{name?.at(0) ?? "A"}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-0 items-start">
        <div
          className={`text-sm ${
            includeEmail || boldName ? "font-semibold" : "font-normal"
          } 
    ${size === "large" ? "text-xl" : ""} p-0 m-0`}
        >
          {name}
        </div>
        {includeEmail && (
          <p
            className={` ${
              size == "large" ? "text-sm" : "text-xs"
            } font-normal text-muted-foreground p-0 m-0`}
          >
            {email}
          </p>
        )}
      </div>
      {icon && <EllipsisVertical width={17} />}
    </div>
  );
}
