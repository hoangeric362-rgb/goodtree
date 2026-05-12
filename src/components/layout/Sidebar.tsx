"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BedDouble, CalendarPlus, Users,
  CreditCard, BarChart3, LogOut, TreePine,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
  { href: "/rooms", icon: BedDouble, label: "Quản lý phòng" },
  { href: "/booking", icon: CalendarPlus, label: "Đặt phòng" },
  { href: "/customers", icon: Users, label: "Khách hàng" },
  { href: "/payment", icon: CreditCard, label: "Thanh toán" },
  { href: "/reports", icon: BarChart3, label: "Báo cáo" },
];

const guestNav = [
  { href: "/booking", icon: CalendarPlus, label: "Đặt phòng" },
  { href: "/payment", icon: CreditCard, label: "Bảng giá" },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const navItems = isAdmin ? adminNav : guestNav;

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col"
      style={{ background: "var(--gt-surface)", borderRight: "1px solid var(--gt-border)" }}>
      {/* Logo */}
      <div className="p-5" style={{ borderBottom: "1px solid var(--gt-border)" }}>
        <div className="flex items-center gap-2">
          <TreePine size={22} color="var(--gt-green)" />
          <div>
            <div className="font-bold text-lg tracking-widest" style={{ color: "var(--gt-green)" }}>
              GOODTREE
            </div>
            <div className="text-xs tracking-widest" style={{ color: "var(--gt-muted)" }}>
              HOTEL & RESORT
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-all cursor-pointer",
                active
                  ? "border-l-2 pl-2.5"
                  : "hover:opacity-80"
              )}
                style={active ? {
                  background: "rgba(74,222,128,0.08)",
                  color: "var(--gt-green)",
                  borderColor: "var(--gt-green)",
                } : {
                  color: "var(--gt-muted)",
                }}>
                <Icon size={16} />
                <span>{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4" style={{ borderTop: "1px solid var(--gt-border)" }}>
        <div className="text-xs px-2 py-1 rounded-full inline-block mb-1 font-semibold tracking-wider"
          style={isAdmin
            ? { background: "rgba(212,168,83,0.15)", color: "var(--gt-gold)" }
            : { background: "rgba(96,165,250,0.15)", color: "var(--gt-info)" }}>
          {isAdmin ? "ADMIN" : "KHÁCH"}
        </div>
        <div className="text-sm font-medium mt-1" style={{ color: "var(--gt-text)" }}>
          {user?.name}
        </div>
        <div className="text-xs mb-3" style={{ color: "var(--gt-muted)" }}>
          {user?.email}
        </div>
        <button onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition-all"
          style={{ border: "1px solid var(--gt-border)", color: "var(--gt-muted)" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = "var(--gt-danger)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--gt-danger)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = "var(--gt-muted)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--gt-border)";
          }}>
          <LogOut size={14} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
