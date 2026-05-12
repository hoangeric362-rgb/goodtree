"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, StatCard, Badge, Button, Table } from "@/components/ui";
import { formatVND, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import { CheckCircle, XCircle, BedDouble, Users, CalendarClock, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const rooms = useQuery(api.rooms.list) ?? [];
  const guests = useQuery(api.guests.list) ?? [];
  const bookings = useQuery(api.bookings.getPending) ?? [];
  const payments = useQuery(api.payments.list) ?? [];

  const approveBooking = useMutation(api.bookings.approve);
  const rejectBooking = useMutation(api.bookings.reject);

  const occupied = rooms.filter((r) => r.status === "occupied").length;
  const available = rooms.filter((r) => r.status === "available").length;
  const booked = rooms.filter((r) => r.status === "booked").length;
  const totalRevenue = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const staying = guests.filter((g) => g.status === "staying");

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard value={String(occupied)} label="Phòng có khách" change="↑ cập nhật realtime" />
        <StatCard value={String(available)} label="Phòng trống" valueColor="var(--gt-green2)" />
        <StatCard value={String(booked)} label="Đã đặt trước" valueColor="var(--gt-warning)" />
        <StatCard
          value={formatVND(totalRevenue)}
          label="Tổng doanh thu"
          valueColor="var(--gt-gold)"
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Room overview */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--gt-text)" }}>
              <BedDouble size={15} className="inline mr-2" />
              Tình trạng phòng
            </h2>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {rooms.slice(0, 15).map((room) => (
              <div key={room._id}
                className="rounded-lg p-2.5 text-center cursor-pointer transition-all"
                style={{ background: "var(--gt-surface)", border: "1px solid var(--gt-border)" }}>
                <div className="font-bold text-sm" style={{ color: "var(--gt-text)" }}>
                  {room.roomNumber}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--gt-muted)" }}>
                  {room.type.slice(0, 3)}
                </div>
                <div className={`text-xs mt-1 px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[room.status]}`}>
                  {STATUS_LABELS[room.status]}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending bookings */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--gt-text)" }}>
              <CalendarClock size={15} className="inline mr-2" />
              Đặt phòng chờ duyệt
            </h2>
            <Badge variant="yellow">{bookings.length} mới</Badge>
          </div>
          {bookings.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "var(--gt-muted)" }}>
              Không có yêu cầu mới
            </p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b._id} className="rounded-xl p-3"
                  style={{ border: "1px solid var(--gt-border)", background: "var(--gt-surface)" }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold" style={{ color: "var(--gt-text)" }}>
                        {b.guestName}
                      </div>
                      <div className="text-xs mt-1" style={{ color: "var(--gt-muted)" }}>
                        {b.phone} · {b.roomType} · {b.checkIn} → {b.checkOut}
                      </div>
                      <Badge variant="yellow" className="mt-1">{b.bookingCode}</Badge>
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="primary"
                        onClick={() => approveBooking({ bookingId: b._id as Id<"bookings"> })}>
                        <CheckCircle size={12} /> OK
                      </Button>
                      <Button size="sm" variant="danger"
                        onClick={() => rejectBooking({ bookingId: b._id as Id<"bookings"> })}>
                        <XCircle size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Current guests */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Users size={15} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--gt-text)" }}>
            Khách đang lưu trú ({staying.length})
          </h2>
        </div>
        <Table headers={["Khách hàng", "Phòng", "Loại phòng", "Nhận phòng", "Trả phòng", "Trạng thái"]}>
          {staying.map((g) => (
            <tr key={g._id}
              style={{ borderBottom: "1px solid rgba(30,46,30,0.5)" }}
              className="hover:bg-white/[0.02] transition-colors">
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black"
                    style={{ background: "var(--gt-green)" }}>
                    {g.name.charAt(0)}
                  </div>
                  <span className="text-sm">{g.name}</span>
                </div>
              </td>
              <td className="px-3 py-3"><Badge variant="blue">{g.roomNumber}</Badge></td>
              <td className="px-3 py-3 text-xs" style={{ color: "var(--gt-muted)" }}>{g.roomType}</td>
              <td className="px-3 py-3 text-xs" style={{ color: "var(--gt-muted)" }}>{g.checkIn}</td>
              <td className="px-3 py-3 text-xs" style={{ color: "var(--gt-muted)" }}>{g.checkOut}</td>
              <td className="px-3 py-3"><Badge variant="green">Đang ở</Badge></td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
