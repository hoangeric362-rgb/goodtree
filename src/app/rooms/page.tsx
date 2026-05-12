"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/lib/auth-context";
import { Card, Badge, Button, Modal } from "@/components/ui";
import { formatVND, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";
import {
  Settings2, Lock, User, Phone, Mail, Calendar,
  BedDouble, Pencil, CheckCircle, X
} from "lucide-react";

const STATUSES = ["available", "occupied", "booked", "cleaning", "repair"] as const;

const STATUS_BG: Record<string, string> = {
  available: "rgba(74,222,128,0.10)",
  occupied:  "rgba(96,165,250,0.12)",
  booked:    "rgba(251,191,36,0.12)",
  cleaning:  "rgba(167,139,250,0.12)",
  repair:    "rgba(248,113,113,0.12)",
};

const STATUS_BORDER: Record<string, string> = {
  available: "rgba(74,222,128,0.30)",
  occupied:  "rgba(96,165,250,0.35)",
  booked:    "rgba(251,191,36,0.35)",
  cleaning:  "rgba(167,139,250,0.35)",
  repair:    "rgba(248,113,113,0.35)",
};

export default function RoomsPage() {
  const { isAdmin } = useAuth();
  const rooms   = useQuery(api.rooms.list)   ?? [];
  const guests  = useQuery(api.guests.list)  ?? [];
  const updateStatus = useMutation(api.rooms.updateStatus);
  const updateGuest  = useMutation(api.guests.update);

  const [selected, setSelected]   = useState<any>(null);
  const [viewFloor, setViewFloor] = useState<number | "all">("all");

  // Edit trạng thái phòng
  const [pendingStatus, setPendingStatus] = useState<string>("");

  // Edit thông tin khách
  const [editMode, setEditMode]   = useState(false);
  const [editForm, setEditForm]   = useState<any>({});

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = rooms.filter((r) => r.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const floors = [1, 2, 3];
  const filteredRooms =
    viewFloor === "all" ? rooms : rooms.filter((r) => r.floor === viewFloor);

  // Tìm khách đang ở phòng được chọn
  const guestInRoom = selected
    ? guests.find(
        (g) =>
          g.roomNumber === selected.roomNumber &&
          g.status !== "checked-out"
      )
    : null;

  const openRoom = (room: any) => {
    setSelected(room);
    setPendingStatus(room.status);
    setEditMode(false);
    setEditForm({});
  };

  const openEditGuest = () => {
    if (!guestInRoom) return;
    setEditForm({
      name:     guestInRoom.name,
      phone:    guestInRoom.phone,
      email:    guestInRoom.email || "",
      checkIn:  guestInRoom.checkIn,
      checkOut: guestInRoom.checkOut,
      notes:    guestInRoom.notes || "",
    });
    setEditMode(true);
  };

  const handleSaveStatus = async () => {
    if (!selected || pendingStatus === selected.status) return;
    await updateStatus({
      roomId: selected._id as Id<"rooms">,
      status: pendingStatus as any,
    });
    setSelected((s: any) => s ? { ...s, status: pendingStatus } : null);
  };

  const handleSaveGuest = async () => {
    if (!guestInRoom) return;
    await updateGuest({
      guestId:  guestInRoom._id,
      name:     editForm.name,
      phone:    editForm.phone,
      email:    editForm.email || undefined,
      checkIn:  editForm.checkIn,
      checkOut: editForm.checkOut,
      notes:    editForm.notes || undefined,
    });
    setEditMode(false);
    alert("✅ Đã cập nhật thông tin khách!");
  };

  return (
    <div className="space-y-5">

      {/* ===== MODAL CHI TIẾT PHÒNG ===== */}
      {isAdmin && selected && (
        <Modal
          title={`Phòng ${selected.roomNumber} — ${selected.type} · Tầng ${selected.floor}`}
          onClose={() => { setSelected(null); setEditMode(false); }}
        >
          {/* Giá & trạng thái hiện tại */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, background: "var(--gt-surface)", borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ fontSize: 11, color: "var(--gt-muted)", marginBottom: 4 }}>Giá phòng</div>
              <div style={{ fontWeight: 700, color: "var(--gt-green)", fontSize: 15 }}>
                {formatVND(selected.pricePerNight)}<span style={{ fontSize: 11, fontWeight: 400, color: "var(--gt-muted)" }}>/đêm</span>
              </div>
            </div>
            <div style={{ flex: 1, background: "var(--gt-surface)", borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ fontSize: 11, color: "var(--gt-muted)", marginBottom: 4 }}>Trạng thái hiện tại</div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[selected.status]}`}>
                {STATUS_LABELS[selected.status]}
              </span>
            </div>
          </div>

          {/* Thông tin khách */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gt-muted)", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>THÔNG TIN KHÁCH</span>
              {guestInRoom && !editMode && (
                <button onClick={openEditGuest}
                  style={{ fontSize: 11, color: "var(--gt-info)", display: "flex", alignItems: "center", gap: 4, cursor: "pointer", background: "none", border: "none" }}>
                  <Pencil size={11} /> Chỉnh sửa
                </button>
              )}
            </div>

            {guestInRoom ? (
              editMode ? (
                /* ── Form chỉnh sửa khách ── */
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Họ và tên", key: "name", placeholder: "Nguyễn Văn A" },
                      { label: "Số điện thoại", key: "phone", placeholder: "0901234567" },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key}>
                        <label style={{ display: "block", fontSize: 11, color: "var(--gt-muted)", marginBottom: 4 }}>{label}</label>
                        <input value={editForm[key]} onChange={e => setEditForm((f: any) => ({ ...f, [key]: e.target.value }))}
                          placeholder={placeholder}
                          style={{ width: "100%", background: "var(--gt-surface)", border: "1px solid var(--gt-border)", borderRadius: 8, padding: "7px 10px", color: "var(--gt-text)", fontSize: 13, outline: "none" }} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "var(--gt-muted)", marginBottom: 4 }}>Email</label>
                    <input value={editForm.email} onChange={e => setEditForm((f: any) => ({ ...f, email: e.target.value }))}
                      placeholder="email@..."
                      style={{ width: "100%", background: "var(--gt-surface)", border: "1px solid var(--gt-border)", borderRadius: 8, padding: "7px 10px", color: "var(--gt-text)", fontSize: 13, outline: "none" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Ngày nhận phòng", key: "checkIn" },
                      { label: "Ngày trả phòng", key: "checkOut" },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <label style={{ display: "block", fontSize: 11, color: "var(--gt-muted)", marginBottom: 4 }}>{label}</label>
                        <input type="date" value={editForm[key]} onChange={e => setEditForm((f: any) => ({ ...f, [key]: e.target.value }))}
                          style={{ width: "100%", background: "var(--gt-surface)", border: "1px solid var(--gt-border)", borderRadius: 8, padding: "7px 10px", color: "var(--gt-text)", fontSize: 13, outline: "none" }} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "var(--gt-muted)", marginBottom: 4 }}>Ghi chú</label>
                    <textarea value={editForm.notes} onChange={e => setEditForm((f: any) => ({ ...f, notes: e.target.value }))}
                      rows={2} placeholder="Yêu cầu đặc biệt..."
                      style={{ width: "100%", background: "var(--gt-surface)", border: "1px solid var(--gt-border)", borderRadius: 8, padding: "7px 10px", color: "var(--gt-text)", fontSize: 13, outline: "none", resize: "vertical" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button onClick={() => setEditMode(false)}
                      style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--gt-border)", background: "transparent", color: "var(--gt-muted)", fontSize: 12, cursor: "pointer" }}>
                      <X size={12} style={{ display: "inline", marginRight: 4 }} />Hủy
                    </button>
                    <button onClick={handleSaveGuest}
                      style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "var(--gt-green2)", color: "#000", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      <CheckCircle size={12} style={{ display: "inline", marginRight: 4 }} />Lưu thay đổi
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Hiển thị thông tin khách ── */
                <div style={{ background: "var(--gt-surface)", borderRadius: 10, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--gt-green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#000", flexShrink: 0 }}>
                      {guestInRoom.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{guestInRoom.name}</div>
                      <Badge variant={guestInRoom.status === "staying" ? "green" : "yellow"}>
                        {guestInRoom.status === "staying" ? "Đang lưu trú" : "Sắp nhận phòng"}
                      </Badge>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { icon: <Phone size={12} />, label: "Điện thoại", value: guestInRoom.phone },
                      { icon: <Mail size={12} />, label: "Email", value: guestInRoom.email || "—" },
                      { icon: <Calendar size={12} />, label: "Nhận phòng", value: guestInRoom.checkIn },
                      { icon: <Calendar size={12} />, label: "Trả phòng", value: guestInRoom.checkOut },
                    ].map(({ icon, label, value }) => (
                      <div key={label} style={{ background: "var(--gt-card)", borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--gt-muted)", marginBottom: 3 }}>
                          {icon} {label}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--gt-text)" }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  {guestInRoom.notes && (
                    <div style={{ marginTop: 8, padding: "7px 10px", background: "var(--gt-card)", borderRadius: 8, fontSize: 12, color: "var(--gt-muted)", fontStyle: "italic" }}>
                      "{guestInRoom.notes}"
                    </div>
                  )}
                </div>
              )
            ) : (
              <div style={{ background: "var(--gt-surface)", borderRadius: 10, padding: "18px 14px", textAlign: "center", color: "var(--gt-muted)", fontSize: 13 }}>
                <BedDouble size={24} style={{ display: "block", margin: "0 auto 6px", opacity: 0.4 }} />
                Phòng chưa có khách
              </div>
            )}
          </div>

          {/* Đổi trạng thái phòng */}
          {!editMode && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gt-muted)", marginBottom: 8 }}>ĐỔI TRẠNG THÁI PHÒNG</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 16 }}>
                {STATUSES.map((s) => (
                  <button key={s} onClick={() => setPendingStatus(s)}
                    style={{
                      padding: "8px 6px", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 500,
                      border: pendingStatus === s ? "2px solid var(--gt-green)" : "1px solid var(--gt-border)",
                      background: pendingStatus === s ? "rgba(74,222,128,0.08)" : "var(--gt-surface)",
                      color: pendingStatus === s ? "var(--gt-green)" : "var(--gt-muted)",
                      transition: "all 0.15s",
                    }}>
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Button variant="outline" onClick={() => setSelected(null)}>Đóng</Button>
                <Button variant="primary" onClick={handleSaveStatus} disabled={pendingStatus === selected.status}>
                  <CheckCircle size={14} /> Lưu trạng thái
                </Button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* ===== STATS ===== */}
      <div className="flex gap-3 flex-wrap">
        {STATUSES.map((s) => (
          <div key={s} className="flex-1 min-w-[110px] rounded-xl px-4 py-3"
            style={{ background: "var(--gt-card)", border: "1px solid var(--gt-border)" }}>
            <div className="text-xl font-bold"
              style={{ color: s === "available" ? "var(--gt-green)" : s === "occupied" ? "var(--gt-info)" : s === "booked" ? "var(--gt-warning)" : s === "cleaning" ? "#a78bfa" : "var(--gt-danger)" }}>
              {counts[s]}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--gt-muted)" }}>{STATUS_LABELS[s]}</div>
          </div>
        ))}
      </div>

      {/* ===== SƠ ĐỒ PHÒNG ===== */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--gt-text)" }}>
            Sơ đồ phòng
            {!isAdmin && (
              <span style={{ marginLeft: 8, fontSize: 11, color: "var(--gt-muted)", fontWeight: 400 }}>
                <Lock size={11} style={{ display: "inline", marginRight: 3 }} />
                Chỉ xem
              </span>
            )}
          </h2>
          {/* Filter tầng */}
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setViewFloor("all")}
              style={{ padding: "5px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", border: "1px solid var(--gt-border)", background: viewFloor === "all" ? "var(--gt-green2)" : "transparent", color: viewFloor === "all" ? "#000" : "var(--gt-muted)" }}>
              Tất cả
            </button>
            {floors.map((f) => (
              <button key={f} onClick={() => setViewFloor(f)}
                style={{ padding: "5px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", border: "1px solid var(--gt-border)", background: viewFloor === f ? "var(--gt-green2)" : "transparent", color: viewFloor === f ? "#000" : "var(--gt-muted)" }}>
                Tầng {f}
              </button>
            ))}
          </div>
        </div>

        {/* Phòng theo tầng */}
        {(viewFloor === "all" ? floors : [viewFloor as number]).map((floor) => {
          const floorRooms = filteredRooms.filter((r) => r.floor === floor);
          if (floorRooms.length === 0) return null;
          return (
            <div key={floor} style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gt-muted)", letterSpacing: 2, marginBottom: 10, paddingBottom: 4, borderBottom: "1px solid var(--gt-border)" }}>
                TẦNG {floor}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                {floorRooms.map((room) => {
                  const hasGuest = guests.some(
                    (g) => g.roomNumber === room.roomNumber && g.status !== "checked-out"
                  );
                  return (
                    <div key={room._id} onClick={() => isAdmin && openRoom(room)}
                      style={{
                        borderRadius: 12, padding: "12px 10px",
                        background: STATUS_BG[room.status] || "var(--gt-surface)",
                        border: `1px solid ${STATUS_BORDER[room.status] || "var(--gt-border)"}`,
                        cursor: isAdmin ? "pointer" : "default",
                        transition: "transform 0.15s, box-shadow 0.15s",
                      }}
                      onMouseEnter={e => { if (isAdmin) { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)"; } }}
                      onMouseLeave={e => { if (isAdmin) { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; } }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: "var(--gt-text)" }}>{room.roomNumber}</span>
                        {isAdmin ? <Settings2 size={13} color="var(--gt-muted)" /> : <Lock size={11} color="var(--gt-muted)" />}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--gt-muted)", marginTop: 2, marginBottom: 6 }}>{room.type}</div>
                      <div className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block ${STATUS_COLORS[room.status]}`}>
                        {STATUS_LABELS[room.status]}
                      </div>
                      {/* Icon khách nếu có */}
                      {hasGuest && (
                        <div style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--gt-info)" }}>
                          <User size={11} /> Có khách
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: "var(--gt-muted)", marginTop: 4 }}>
                        {(room.pricePerNight / 1000).toFixed(0)}K/đêm
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Chú thích */}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--gt-border)", display: "flex", gap: 16, flexWrap: "wrap" }}>
          {STATUSES.map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s]}`}>●</span>
              <span style={{ color: "var(--gt-muted)" }}>{STATUS_LABELS[s]}</span>
            </div>
          ))}
          {isAdmin && (
            <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--gt-muted)" }}>
              💡 Click vào phòng để xem chi tiết & chỉnh sửa
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
