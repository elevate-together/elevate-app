"use server";

import { signIn, signOut } from "@/auth";

export const handleSignIn = async () => {
  try {
    await signIn("google");
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
