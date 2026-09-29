import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthProvider";

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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
