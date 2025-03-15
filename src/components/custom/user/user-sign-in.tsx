"use client";

import { Button } from "@/components/ui/button";
import { handleSignIn } from "@/lib/signInOutActions";
import { Loader, LogIn } from "lucide-react";
import { useState } from "react";
import { ButtonProps } from "@/components/ui/button";

export default function SignIn({ children, ...prop }: ButtonProps) {
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
      {isLoading ? (
        <Button
          className="w-full"
          onClick={handleClick}
          {...prop}
          disabled={isLoading}
        >
          <Loader className="animate-spin h-4 w-4 mr-2" />
        </Button>
      ) : children ? (
        <Button
          className="w-full"
          onClick={handleClick}
          {...prop}
          disabled={isLoading}
        >
          {children}
        </Button>
      ) : (
        <Button
          className="w-full"
          onClick={handleClick}
          {...prop}
          disabled={isLoading}
        >
          <LogIn /> Sign In
        </Button>
      )}
    </div>
  );
}
