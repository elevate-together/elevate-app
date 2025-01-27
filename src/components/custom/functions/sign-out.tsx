"use client";

import { useIsMobile } from "@/components/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { handleSignOut } from "@/lib/signInOutActions";
import { LogOut } from "lucide-react";

export const SignOut = ({ hideOnMobile = false, ...prop }) => {
  const isMobile = useIsMobile();

  if (hideOnMobile && isMobile) return null;

  return (
    <div className="w-full">
      <Button className="w-full" onClick={handleSignOut} {...prop}>
        <LogOut />
        Sign Out
      </Button>
    </div>
  );
};
