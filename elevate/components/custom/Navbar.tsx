"use client";

import Link from "next/link";
import { Menu, Users } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import AvatarDropdown from "@/components/custom/AvatarDropdown";
import { Session } from "next-auth";

interface HeaderProps {
  session: Session | null;
}

export const Navbar = ({ session }: HeaderProps) => {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center justify-between bg-black">
      {/* Logo */}
      <Link className="flex items-center justify-center" href="/">
        <Users className="h-6 w-6 text-white" />
        <span className="ml-2 text-2xl font-bold text-white">ELEVATE</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-4 sm:gap-4 items-center">
        {session && session.user ? (
          <AvatarDropdown user={session.user} />
        ) : (
          <>
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary">Sign Up</Button>
            </Link>
          </>
        )}
      </nav>

      <div className="md:hidden flex items-center bg-black">
        {session && session.user ? (
          <AvatarDropdown user={session.user} />
        ) : (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-white" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-4 bg-black text-white">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetClose />
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-4">
                <Link href="/login">
                  <Button variant="ghost" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
};
