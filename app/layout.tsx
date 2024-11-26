import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/auth";

import "./globals.css";
import { Navbar } from "@components/custom/Navbar";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Elevate",
  description: "Elevate your Christian accountability.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <Navbar session={session} />
          {children}
          <Toaster
            toastOptions={{
              classNames: {
                error: "bg-red-400",
                success: "text-green-600",
                warning: "text-yellow-600",
                info: "bg-blue-400",
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
