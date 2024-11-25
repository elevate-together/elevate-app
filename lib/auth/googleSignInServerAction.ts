"use server";

import { signIn } from "@/auth";

export const handleGoogleSignIn = async () => {
  "use server";
  try {
    await signIn("google");
  } catch (error) {
    throw error;
  }
};
