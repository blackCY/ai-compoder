import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServerStoreQueryProvider } from "lib/serverStore";
import { Provider } from "jotai";
import { Toaster } from "lib/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CommandPalette } from "lib/components/biz/CommandPalette";

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
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <head>
        {/* 使用这个调试工具后，在页面上直接选择"未阻止冒泡的文本"（没有使用该工具来选择）时，会导致页面卡死，因此这里暂时注释掉 */}
        {/* {process.env.NODE_ENV === "development" && (
            <Script
              src="//unpkg.com/react-grab/dist/index.global.js"
              crossOrigin="anonymous"
              strategy="beforeInteractive"
            />
          )} */}
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ServerStoreQueryProvider>
          <Provider>
            {children}
            <CommandPalette />
          </Provider>
        </ServerStoreQueryProvider>
        <Toaster />
        <SpeedInsights />
      </body>
    </html>
  );
}
