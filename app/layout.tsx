import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServerStoreQueryProvider } from "@/lib/server-store";
import Script from "next/script";
import { Provider } from "jotai";
import { Toaster } from "@/components/ui/sonner";
import { ViewTransitions } from "next-view-transitions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Compoder",
  description: "AI-powered code generation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="zh-CN" suppressHydrationWarning data-scroll-behavior="smooth">
        <head>
          {process.env.NODE_ENV === "development" && (
            <Script
              src="//unpkg.com/react-grab/dist/index.global.js"
              crossOrigin="anonymous"
              strategy="beforeInteractive"
            />
          )}
        </head>

        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ServerStoreQueryProvider>
            <Provider>{children}</Provider>
          </ServerStoreQueryProvider>
          <Toaster />
        </body>
      </html>
    </ViewTransitions>
  );
}
