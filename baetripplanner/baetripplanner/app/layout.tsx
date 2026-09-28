import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BaeTripPlanner",
  description: "自建行程規劃工具",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
