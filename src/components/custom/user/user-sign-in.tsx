"use client";

import { Button } from "@/components/ui/button";
import { handleSignIn } from "@/lib/signInOutActions";
import { Loader, LogIn } from "lucide-react";
import { useState } from "react";
import { ButtonProps } from "@/components/ui/button";

type SignInProps = ButtonProps & {
  callback?: string;
};

export default function SignIn({
  callback = "/",
  children,
  ...prop
}: SignInProps) {
  const [isLoading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await handleSignIn(callback);
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
