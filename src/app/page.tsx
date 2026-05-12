"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push(user.role === "admin" ? "/dashboard" : "/booking");
    } else {
      router.push("/login");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--gt-bg)" }}>
      <div style={{ color: "var(--gt-green)" }} className="text-lg font-semibold animate-pulse">
        GOODTREE...
      </div>
    </div>
  );
}
