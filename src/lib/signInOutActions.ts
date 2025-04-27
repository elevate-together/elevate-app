"use server";

import { signIn, signOut } from "@/auth";

export const handleSignIn = async (callbackUrl?: string) => {
  try {
    await signIn("google", {
      callbackUrl: callbackUrl || "/",
    });
  } catch (error) {
    throw error;
  }
};

export const handleSignOut = async () => {
  try {
    await signOut();
  } catch (error) {
    throw error;
  }
};
