"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { handleSignOut } from "@lib/auth/signOutServerAction";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@components/ui/button";

interface AvatarDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const AvatarDropdown: React.FC<AvatarDropdownProps> = ({ user }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex items-center gap-4">
          <div className="text-sm font-medium text-white">{user.name}</div>

          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.image || ""}
              alt={user.name || "User avatar"}
            />
            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </button>
      </SheetTrigger>
      <SheetContent className="flex flex-col justify-between h-full">
        <SheetHeader>
          <SheetTitle>Hello, {user.name}!</SheetTitle>
          <SheetDescription>
            This is where you can access all your pages
          </SheetDescription>
        </SheetHeader>

        {/* The Sign-Out Button */}
        <div className="mt-auto flex flex-col gap-5 ">
          <Button onClick={() => handleSignOut()} className="w-full">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
          <div className="flex gap-4 items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user.image || ""}
                alt={user.name || "User avatar"}
              />
              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start gap-0">
              <div className="text-sm font-bold text-black">{user.name}</div>
              <div className="text-sm font-medium text-gray-500">
                {user.email}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AvatarDropdown;
