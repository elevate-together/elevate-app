"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { handleGoogleSignIn } from "@lib/auth/googleSignInServerAction";
import { toast } from "sonner";

const LoginCard = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    setIsLoading(true);
    try {
      await handleGoogleSignIn();
    } catch (error) {
      toast.error(`Failed to sign in: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg m-6 flex flex-col">
      <div className="text-2xl font-bold"> Log In</div>
      <div className="mb-2 text-sm text-muted-foreground">
        Log in with your Google account to access Elevate
      </div>
      <div className="flex flex-col items-center">
        <Button
          variant="secondary"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => signIn()}
          disabled={isLoading}
          aria-label="Sign in with Google"
        >
          {isLoading ? "Signing In..." : "Continue with Google"}
        </Button>
      </div>
    </div>
  );
};

export default LoginCard;
