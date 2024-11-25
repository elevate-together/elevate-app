"use server";

import { auth } from "@/lib/auth/authConfig";

export const getUserName = async () => {
  const session = await auth();
  if (session?.user) {
    return session.user.name;
  }
  else{
    return null
  }
};