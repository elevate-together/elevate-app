import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { cookies } from "next/headers";
import { ZoneType } from "@prisma/client";
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
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
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
