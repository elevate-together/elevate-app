import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { cookies } from "next/headers";
import { Role, ZoneType } from "@prisma/client";
import { getEnumKeyFromIana } from "./lib/utils";
import prisma from "./lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },

  events: {
    async createUser({ user }) {
      const cookieStore = await cookies();

      const rawTz = cookieStore.get("tz")?.value;
      const timeZone: ZoneType = getEnumKeyFromIana(
        rawTz || "America/New_York"
      );

      await prisma.user.update({
        where: { id: user.id },
        data: { timeZone: timeZone },
      });
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.timeZone = user.timeZone;
        token.role = user.role;
        token.createdAt = user.createdAt.toISOString();
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.timeZone = token.timeZone as ZoneType;
        session.user.role = token.role as Role;
        if (
          typeof token.createdAt === "string" ||
          token.createdAt instanceof Date
        ) {
          session.user.createdAt = new Date(token.createdAt);
        } else {
          // fallback in case createdAt is missing or wrong type
          session.user.createdAt = new Date();
        }
      }

      return session;
    },

    redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
});
