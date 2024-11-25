"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
    <Card className="w-full max-w-md shadow-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Sign in with your Google account to access Elevate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col items-center">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => signIn()}
            disabled={isLoading}
            aria-label="Sign in with Google"
          >
            {isLoading ? "Signing In..." : "Continue with Google"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginCard;
