"use client";

import { menu_items } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { cn } from "@/lib/utils";

interface FooterClientProps {
  session: Session;
}

export function FooterClient({ session }: FooterClientProps) {
  const pathname = usePathname();

  if (!session) return null;

  return (
    <div className="block md:hidden border-t border-border pt-4 pb-8 px-4 bg-white">
      <footer className="flex justify-evenly">
        {menu_items.map((item) => {
          const url = item.url.replace("{id}", session.user.id || "");
          const isActive = pathname === url;

          return (
            <Link
              key={item.title}
              href={url}
              className={cn(
                "flex flex-col items-center flex-1 text-sm gap-1",
                isActive ? "text-black" : "text-gray-500"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-black" : "text-gray-500"
                )}
                aria-hidden="true"
              />
              <span className="font-normal">{item.titleShort}</span>
            </Link>
          );
        })}
      </footer>
    </div>
  );
}
