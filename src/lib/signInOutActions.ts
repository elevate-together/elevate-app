// app/components/auth/clientSignIn.tsx
"use client";

import { signIn } from "next-auth/react";
import { signOut } from "next-auth/react";

export const handleSignIn = async (callbackUrl?: string) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  document.cookie = `tz=${timeZone}; path=/`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const url = `${baseUrl}/${callbackUrl}`;

  await signIn("google", {
    callbackUrl: url,
  });
};

export const handleSignOut = async () => {
  try {
    await signOut({ redirect: true }); // or false if you want to handle redirect manually
  } catch (error) {
    console.error("Error signing out:", error);
  }
};
