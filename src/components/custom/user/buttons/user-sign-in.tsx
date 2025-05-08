"use client";

import { Button } from "@/components/ui/button";
import { handleSignIn } from "@/lib/signInOutActions";
import { Loader, LogIn } from "lucide-react";
import { useState } from "react";
import { ButtonProps } from "@/components/ui/button";
import { toast } from "sonner";

type SignInProps = ButtonProps & {
  callback?: string;
  children?: React.ReactNode;
};

export default function SignIn({
  callback = "/",
  children,
  ...props
}: SignInProps) {
  const [isLoading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await handleSignIn(callback);
    } catch {
      toast.error("Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        className="w-full flex items-center justify-center gap-2"
        onClick={handleClick}
        disabled={isLoading}
        aria-busy={isLoading}
        aria-disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader className="animate-spin h-4 w-4" />
        ) : (
          <>
            {children ?? (
              <>
                <LogIn className="h-4 w-4" /> "Sign In"
              </>
            )}
          </>
        )}
      </Button>
    </div>
  );
}
