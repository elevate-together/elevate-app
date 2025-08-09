// types/next-auth.d.ts
import { Role, ZoneType } from "@prisma/client";
// import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
      role: Role;
      timeZone: ZoneType;
      createdAt: Date;
    };
  }

  interface User {
    role: Role;
    timeZone: ZoneType;
    createdAt: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    image: string;
    role: string;
    timeZone: string;
    createdAt: string;
  }
}
