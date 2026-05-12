"use client";

import { useAuth } from "@/lib/auth-context";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Tổng quan",
  "/rooms": "Quản lý phòng",
  "/booking": "Đặt phòng",
  "/customers": "Khách hàng",
  "/payment": "Thanh toán",
  "/reports": "Báo cáo",
};

export default function Topbar({ pathname }: { pathname: string }) {
  const title = PAGE_TITLES[pathname] || "GOODTREE";

  return (
    <header className="flex items-center justify-between px-6 py-3"
      style={{ background: "var(--gt-surface)", borderBottom: "1px solid var(--gt-border)" }}>
      <div>
        <h1 className="text-base font-semibold" style={{ color: "var(--gt-text)" }}>
          {title}
        </h1>
        <p className="text-xs" style={{ color: "var(--gt-muted)" }}>
          GOODTREE Hotel & Resort · Biên Hòa, Đồng Nai
        </p>
      </div>
      <div className="text-xs" style={{ color: "var(--gt-muted)" }}>
        {new Date().toLocaleDateString("vi-VN", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        })}
      </div>
    </header>
  );
}
