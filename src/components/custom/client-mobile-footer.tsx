"use client";

import { usePathname } from "next/navigation";
import { Users, HelpingHandIcon, Hand, User } from "lucide-react";
import Link from "next/link";

export default function ClientMobileFooter({ id }: { id: string }) {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `flex flex-col items-center ${
      pathname === path || pathname.startsWith(path + "/")
        ? "text-primary"
        : "text-muted-foreground"
    }`;

  const iconClass = "h-6 w-6";

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-card text-muted-foreground p-3 flex justify-around items-center border block md:hidden pb-8">
      <Link href="/" className={linkClass("/")}>
        <HelpingHandIcon className={iconClass} />
        <span className="text-xs">Home</span>
      </Link>
      <Link href="/groups" className={linkClass("/groups")}>
        <Users className={iconClass} />
        <span className="text-xs">Groups</span>
      </Link>
      <Link href={`/requests/${id}`} className={linkClass("/requests")}>
        <Hand className={iconClass} />
        <span className="text-xs">Requests</span>
      </Link>

      <Link href={`/user/${id}`} className={linkClass("/user")}>
        <User className={iconClass} />
        <span className="text-xs">Profile</span>
      </Link>
    </footer>
  );
}
