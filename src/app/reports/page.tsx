"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, StatCard } from "@/components/ui";
import { formatVND } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";

const DAILY_DATA = [
  { label: "3/5", revenue: 12500000 },
  { label: "4/5", revenue: 9800000 },
  { label: "5/5", revenue: 15200000 },
  { label: "6/5", revenue: 18400000 },
  { label: "7/5", revenue: 22100000 },
  { label: "8/5", revenue: 19600000 },
  { label: "9/5", revenue: 14300000 },
];

const MONTHLY_DATA = [
  { label: "T1", revenue: 280000000, target: 300000000 },
  { label: "T2", revenue: 245000000, target: 300000000 },
  { label: "T3", revenue: 312000000, target: 300000000 },
  { label: "T4", revenue: 398000000, target: 350000000 },
  { label: "T5", revenue: 187000000, target: 350000000 },
];

const ROOM_TYPE_DATA = [
  { type: "Standard", rooms: 5, revenue: 4200000, occupancy: 60 },
  { type: "Deluxe", rooms: 5, revenue: 5800000, occupancy: 80 },
  { type: "Suite", rooms: 3, revenue: 7500000, occupancy: 33 },
  { type: "Presidential", rooms: 2, revenue: 8900000, occupancy: 50 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "var(--gt-card)", border: "1px solid var(--gt-border)", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--gt-text)" }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.color }}>
            {p.name === "revenue" ? "Doanh thu: " : "Mục tiêu: "}
            {formatVND(p.value)}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const [chartView, setChartView] = useState<"daily" | "monthly">("daily");
  const rooms = useQuery(api.rooms.list) ?? [];
  const payments = useQuery(api.payments.list) ?? [];
  const guests = useQuery(api.guests.list) ?? [];

  const totalRevenue = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const today = new Date().toDateString();
  const todayRevenue = payments
    .filter(p => p.status === "paid" && new Date(p.createdAt).toDateString() === today)
    .reduce((s, p) => s + p.amount, 0);
  const occupied = rooms.filter(r => r.status === "occupied").length;
  const occupancyRate = rooms.length ? Math.round(occupied / rooms.length * 100) : 0;
  const staying = guests.filter(g => g.status === "staying").length;

  const data = chartView === "daily" ? DAILY_DATA : MONTHLY_DATA;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard value={formatVND(todayRevenue || 14300000)} label="Hôm nay" valueColor="var(--gt-green)" />
        <StatCard value={formatVND(totalRevenue || 112400000)} label="Tổng doanh thu" valueColor="var(--gt-gold)" />
        <StatCard value={`${occupancyRate}%`} label="Tỷ lệ lấp đầy" change={`${occupied}/${rooms.length} phòng`} />
        <StatCard value={String(staying)} label="Khách đang ở" valueColor="var(--gt-info)" />
      </div>

      {/* Revenue chart */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--gt-text)" }}>Biểu đồ doanh thu</h2>
          <div style={{ display: "flex", gap: 6 }}>
            {(["daily", "monthly"] as const).map(v => (
              <button key={v} onClick={() => setChartView(v)}
                style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "1px solid var(--gt-border)", background: chartView === v ? "var(--gt-green2)" : "transparent", color: chartView === v ? "#000" : "var(--gt-muted)", transition: "all .15s" }}>
                {v === "daily" ? "Theo ngày" : "Theo tháng"}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          {chartView === "daily" ? (
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,46,30,0.5)" />
              <XAxis dataKey="label" tick={{ fill: "var(--gt-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} tick={{ fill: "var(--gt-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} name="revenue" />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,46,30,0.5)" />
              <XAxis dataKey="label" tick={{ fill: "var(--gt-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} tick={{ fill: "var(--gt-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={v => v === "revenue" ? "Doanh thu" : "Mục tiêu"} />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: "#22c55e", r: 4 }} name="revenue" />
              <Line type="monotone" dataKey="target" stroke="#d4a853" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="target" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </Card>

      {/* Room type performance */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--gt-text)" }}>Doanh thu theo loại phòng</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={ROOM_TYPE_DATA} layout="vertical" margin={{ left: 10, right: 10 }}>
              <XAxis type="number" tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} tick={{ fill: "var(--gt-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="type" tick={{ fill: "var(--gt-muted)", fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip formatter={(v: number) => formatVND(v)} contentStyle={{ background: "var(--gt-card)", border: "1px solid var(--gt-border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#4ade80" radius={[0, 4, 4, 0]} name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--gt-text)" }}>Tỷ lệ lấp đầy theo loại</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ROOM_TYPE_DATA.map((r) => (
              <div key={r.type}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: "var(--gt-text)" }}>{r.type}</span>
                  <span style={{ fontSize: 12, color: "var(--gt-green)", fontWeight: 600 }}>{r.occupancy}%</span>
                </div>
                <div style={{ height: 6, background: "var(--gt-border)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${r.occupancy}%`, background: r.occupancy >= 70 ? "var(--gt-green2)" : r.occupancy >= 40 ? "var(--gt-warning)" : "var(--gt-danger)", borderRadius: 3, transition: "width .5s" }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: "12px", background: "var(--gt-surface)", borderRadius: 8 }}>
            <div style={{ display: "flex" }}>
              {[
                { label: "Standard", count: 5, color: "var(--gt-info)", pct: 33 },
                { label: "Deluxe", count: 5, color: "var(--gt-green)", pct: 33 },
                { label: "Suite", count: 3, color: "var(--gt-warning)", pct: 20 },
                { label: "Pres.", count: 2, color: "var(--gt-gold)", pct: 14 },
              ].map(r => (
                <div key={r.label} style={{ flex: r.pct, background: r.color, padding: "8px 4px", textAlign: "center", opacity: 0.85 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#000" }}>{r.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#000" }}>{r.count}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
