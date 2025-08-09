import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui";
import { Sidebar } from "@/components/common/molecules/sidebar/sidebar";
import { Navbar } from "@/components/common/molecules/navbar/navbar";
import { ServiceWorker } from "@/components/service-worker";
import { Footer } from "@/components/common/molecules/footer/footer";

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
          <main className="flex w-full min-h-screen max-h-screen">
            <Sidebar />
            <div className="flex flex-col w-full">
              <Navbar />
              <div className="flex-1 overflow-auto">{children}</div>
              <Footer />
            </div>
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
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
