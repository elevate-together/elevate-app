import AppSidebar from "@/components/custom/app-sidebar";
import Navbar from "@/components/custom/navbar";
import ServiceWorker from "@/components/service-worker";
import { ThemeProvider } from "@/components/theme-provider";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased overscroll-contain`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <main className="flex flex-col h-screen w-full overscroll-contain">
              <Navbar />
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {children}
              </div>
              <MobileFooter />
            </main>

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
