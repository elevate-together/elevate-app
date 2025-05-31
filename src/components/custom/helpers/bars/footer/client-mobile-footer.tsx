"use client";

import { usePathname } from "next/navigation";
import {
  Users,
  HelpingHandIcon,
  Hand,
  User,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";

export default function ClientMobileFooter({ userId }: { userId: string }) {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `flex flex-col items-center ${
      pathname === path || pathname.startsWith(path + "/")
        ? "text-primary"
        : "text-muted-foreground"
    }`;

  const iconClass = "h-6 w-6";

  return (
    <footer className="h-[82px] w-full pb-4 bg-card text-muted-foreground flex justify-around items-center border-t block md:hidden">
      <Link href="/" className={linkClass("/")}>
        <HelpingHandIcon className={iconClass} />
        <span className="text-xs">Home</span>
      </Link>
      <Link href="/groups" className={linkClass("/groups")}>
        <Users className={iconClass} />
        <span className="text-xs">Groups</span>
      </Link>
      <Link href={`/requests/${userId}`} className={linkClass("/requests")}>
        <Hand className={iconClass} />
        <span className="text-xs">Requests</span>
      </Link>
      <Link href={`/user/${userId}`} className={linkClass("/user")}>
        <User className={iconClass} />
        <span className="text-xs">Profile</span>
      </Link>
      <Link
        href={`/reminder/create/${userId}`}
        className={linkClass("/reminder/create")}
      >
        <ClipboardList className={iconClass} />
        <span className="text-xs">Reminders</span>
      </Link>
    </footer>
  );
}
