"use client";

import { Button } from "@/components/ui/button";
import { handleSignIn } from "@/lib/signInOutActions"; 
import { Loader, LogIn } from "lucide-react";
import { useState } from "react";

export default function SignIn({ ...prop }) {
  const [isLoading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await handleSignIn();
    } catch (error) {
      console.error("Sign-in failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        className="w-full"
        onClick={handleClick}
        {...prop}
        disabled={isLoading}
      >
        {isLoading ? <Loader className="animate-spin h-4 w-4 mr-2" /> : null}
        <LogIn />
        Sign In
      </Button>
    </div>
  );
}
