import AppSidebar from "@/components/custom/app-sidebar";
import BackButton from "@/components/custom/functions/back-button";
import Navbar from "@/components/custom/navbar";
import ServiceWorker from "@/components/service-worker";
import { ThemeProvider } from "@/components/theme-provider";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MobileFooter from "@/components/custom/mobile-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elevate",
  description: "Elevate Together",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
              {/* Navbar */}
              <Navbar />

              <Separator />
              <div className="grid grid-cols-[auto_1fr] gap-2 p-7 pl-3 w-full">
                <div>
                  <BackButton />
                </div>
                <div className="w-full h-full">{children}</div>
              </div>
            </main>
            <MobileFooter />
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
            <ServiceWorker />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
