"use client";

import Link from "next/link";
import { Menu, Users, LogIn, UserRoundPlus } from "lucide-react";
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
import { handleGoogleSignIn } from "@/lib/auth/googleSignInServerAction";

interface HeaderProps {
  session: Session | null;
}

export const Navbar = ({ session }: HeaderProps) => {
  return (
    <header className="px-4 sm:px-6 h-14 flex items-center justify-between bg-black">
      {/* Logo */}
      <Link
        className="flex items-center justify-center mx-auto lg:mx-0"
        href="/"
      >
        <Users className="h-6 w-6 text-white" />
        <span className="ml-2 text-2xl font-bold text-white">ELEVATE</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-4 sm:gap-4 items-center">
        {session && session.user ? (
          <AvatarDropdown user={session.user} />
        ) : (
          <>
            <Button variant="outline" onClick={() => handleGoogleSignIn()}>
              <LogIn />
              Log In
            </Button>
            <Button variant="outline" onClick={() => handleGoogleSignIn()}>
              <UserRoundPlus />
              Sign Up
            </Button>
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
            <SheetContent side="right" className="p-4 bg-white text-black">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetClose />
              </SheetHeader>
              <nav className="mt-4 flex flex-col justify-center gap-4 h-[70vh]">
                <div className="text-xl font-bold">Welcome to Elevate</div>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleGoogleSignIn()}
                >
                  <LogIn />
                  Log In
                </Button>
                <Button className="w-full" onClick={() => handleGoogleSignIn()}>
                  <UserRoundPlus />
                  Sign Up
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
};
