"use client";

import { Button } from "@/components/ui/button";
import { handleSignOut } from "@/lib/signInOutActions";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function SignOut({ hideOnMobile = false, ...prop }) {
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    try {
      await handleSignOut();
      router.push("/");
    } catch {
      toast.error("Sign-out failed:");
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
