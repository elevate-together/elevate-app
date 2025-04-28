"use client";

import { Button } from "@/components/ui/button";
import { handleSignOut } from "@/lib/signInOutActions";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function SignOut({ hideOnMobile = false, ...prop }) {
  const [isLoading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await handleSignOut();
    } catch (error) {
      console.error("Sign-out failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        className={`w-full ${hideOnMobile ? "hidden md:flex" : ""}`}
        onClick={handleClick}
        disabled={isLoading}
        {...prop}
      >
        {isLoading ? "Signing out..." : <LogOut />}
        {!isLoading && "Sign Out"}
      </Button>
    </div>
  );
}
