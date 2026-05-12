"use client";

import "./globals.css";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AuthProvider } from "@/lib/auth-context";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://your-convex-url.convex.cloud"
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <title>GOODTREE Hotel Management</title>
        <meta name="description" content="Hệ thống quản lý khách sạn GOODTREE" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ConvexProvider client={convex}>
          <AuthProvider>{children}</AuthProvider>
        </ConvexProvider>
      </body>
    </html>
  );
}
