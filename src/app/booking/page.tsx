"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/lib/auth-context";
import { Card, Badge, Button, Input, Select, Modal } from "@/components/ui";
import { CheckCircle, XCircle, CalendarPlus, Send, BedDouble } from "lucide-react";

const ROOM_TYPES = [
  { value: "Standard", label: "Standard - 800,000₫/đêm" },
  { value: "Deluxe", label: "Deluxe - 1,200,000₫/đêm" },
  { value: "Suite", label: "Suite - 2,500,000₫/đêm" },
  { value: "Presidential", label: "Presidential - 5,000,000₫/đêm" },
];

const GUEST_COUNT = [
  { value: "1", label: "1 khách" },
  { value: "2", label: "2 khách" },
  { value: "3", label: "3 khách" },
  { value: "4", label: "4 khách" },
];

export default function BookingPage() {
  const { isAdmin, user } = useAuth();
  const bookings = useQuery(api.bookings.list) ?? [];
  const rooms = useQuery(api.rooms.list) ?? [];
  const pending = bookings.filter((b) => b.status === "pending");

  const createBooking = useMutation(api.bookings.create);
  const approveBooking = useMutation(api.bookings.approve);
  const rejectBooking = useMutation(api.bookings.reject);
  const assignRoom = useMutation(api.bookings.assignRoomAndCheckIn);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [form, setForm] = useState({
    guestName: user?.name || "",
    phone: "",
    email: user?.email || "",
    roomType: "Deluxe",
    preferredRoom: "",
    checkIn: today,
    checkOut: tomorrow,
    guests: "2",
    notes: "",
  });
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Admin: modal gán phòng
  const [assignModal, setAssignModal] = useState<any>(null);
  const [selectedRoomId, setSelectedRoomId] = useState("");

  // Admin: form đặt thủ công
  const [manualForm, setManualForm] = useState({
    guestName: "", phone: "", email: "",
    roomType: "Standard", preferredRoom: "",
    checkIn: today, checkOut: tomorrow,
    guests: "2", notes: "",
  });

  const handleGuestSubmit = async () => {
    if (!form.guestName || !form.phone || !form.checkIn || !form.checkOut) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    setLoading(true);
    try {
      await createBooking({
        guestName: form.guestName,
        phone: form.phone,
        email: form.email,
        roomType: form.roomType,
        preferredRoom: form.preferredRoom || undefined,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: parseInt(form.guests),
        notes: form.notes || undefined,
      });
      setSuccess(`Đặt phòng thành công! Chúng tôi sẽ liên hệ xác nhận trong 30 phút.`);
      setForm(f => ({ ...f, phone: "", notes: "", preferredRoom: "" }));
    } catch (e) {
      alert("Có lỗi xảy ra, thử lại sau!");
    }
    setLoading(false);
  };

  const handleManualBook = async () => {
    if (!manualForm.guestName || !manualForm.phone) {
      alert("Vui lòng nhập tên và số điện thoại khách!");
      return;
    }
    await createBooking({
      guestName: manualForm.guestName,
      phone: manualForm.phone,
      email: manualForm.email || "",
      roomType: manualForm.roomType,
      preferredRoom: manualForm.preferredRoom || undefined,
      checkIn: manualForm.checkIn,
      checkOut: manualForm.checkOut,
      guests: parseInt(manualForm.guests),
      notes: manualForm.notes || undefined,
    });
    alert("Đã tạo đặt phòng thành công!");
    setManualForm({ guestName: "", phone: "", email: "", roomType: "Standard", preferredRoom: "", checkIn: today, checkOut: tomorrow, guests: "2", notes: "" });
  };

  const handleAssignRoom = async () => {
    if (!selectedRoomId) { alert("Vui lòng chọn phòng!"); return; }
    const room = rooms.find(r => r._id === selectedRoomId);
    if (!room) return;
    await assignRoom({
      bookingId: assignModal._id as Id<"bookings">,
      roomId: selectedRoomId as Id<"rooms">,
      roomNumber: room.roomNumber,
    });
    setAssignModal(null);
    setSelectedRoomId("");
    alert(`✅ Đã gán phòng ${room.roomNumber} cho ${assignModal.guestName} và thêm vào danh sách khách!`);
  };

  // Danh sách phòng available cho dropdown gán phòng
  const availableRooms = rooms.filter(r => r.status === "available");

  // GUEST VIEW
  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {success && (
          <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 10, padding: "14px 16px", marginBottom: 16, fontSize: 13, color: "var(--gt-green)" }}>
            <CheckCircle size={14} style={{ display: "inline", marginRight: 6 }} />
            {success}
          </div>
        )}
        <Card>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gt-green)", marginBottom: 4 }}>
              <CalendarPlus size={18} style={{ display: "inline", marginRight: 6 }} />
              Đặt phòng tại GOODTREE
            </div>
            <div style={{ fontSize: 12, color: "var(--gt-muted)" }}>
              Điền thông tin để đặt phòng. Chúng tôi xác nhận trong 30 phút.
            </div>
          </div>

          <div className="space-y-3">
            <Input label="Họ và tên" value={form.guestName} onChange={v => setForm(f => ({ ...f, guestName: v }))} placeholder="Nguyễn Văn A" required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Số điện thoại" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="0901234567" required />
              <Input label="Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="email@..." type="email" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Ngày nhận phòng" value={form.checkIn} onChange={v => setForm(f => ({ ...f, checkIn: v }))} type="date" required />
              <Input label="Ngày trả phòng" value={form.checkOut} onChange={v => setForm(f => ({ ...f, checkOut: v }))} type="date" required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Select label="Loại phòng" value={form.roomType} onChange={v => setForm(f => ({ ...f, roomType: v }))} options={ROOM_TYPES} required />
              <Select label="Số khách" value={form.guests} onChange={v => setForm(f => ({ ...f, guests: v }))} options={GUEST_COUNT} />
            </div>

            {/* ✅ Số phòng mong muốn */}
            <Input
              label="Số phòng mong muốn (không bắt buộc)"
              value={form.preferredRoom}
              onChange={v => setForm(f => ({ ...f, preferredRoom: v }))}
              placeholder="Ví dụ: 204, 301... (để trống nếu không có yêu cầu)"
            />

            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--gt-muted)", marginBottom: 6, fontWeight: 500 }}>Ghi chú đặc biệt</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Yêu cầu đặc biệt, tầng cao, hướng cảnh..." rows={2}
                style={{ width: "100%", background: "var(--gt-surface)", border: "1px solid var(--gt-border)", borderRadius: 8, padding: "9px 12px", color: "var(--gt-text)", fontSize: 13, outline: "none", resize: "vertical" }} />
            </div>
          </div>

          <button onClick={handleGuestSubmit} disabled={loading}
            style={{ width: "100%", padding: "13px", marginTop: 16, background: "var(--gt-green2)", color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1 }}>
            <Send size={15} />
            {loading ? "Đang gửi..." : "Gửi yêu cầu đặt phòng"}
          </button>
        </Card>

        {/* Lịch sử đặt phòng của khách */}
        {bookings.filter(b => b.email === user?.email).length > 0 && (
          <Card className="mt-4">
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--gt-text)" }}>
              Lịch sử đặt phòng của bạn
            </div>
            {bookings.filter(b => b.email === user?.email).map(b => (
              <div key={b._id} style={{ padding: "10px 0", borderBottom: "1px solid var(--gt-border)", fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600 }}>{b.bookingCode}</span>
                  <Badge variant={b.status === "approved" ? "green" : b.status === "rejected" ? "red" : "yellow"}>
                    {b.status === "approved" ? "Đã duyệt" : b.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
                  </Badge>
                </div>
                <div style={{ color: "var(--gt-muted)", marginTop: 2 }}>
                  {b.roomType} · {b.checkIn} → {b.checkOut}
                  {b.preferredRoom && <span> · Phòng muốn: <strong style={{ color: "var(--gt-green)" }}>{b.preferredRoom}</strong></span>}
                  {b.assignedRoomNumber && <span> · <strong style={{ color: "var(--gt-gold)" }}>Phòng được gán: {b.assignedRoomNumber}</strong></span>}
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    );
  }

  // ADMIN VIEW
  return (
    <div>
      {/* Modal gán phòng */}
      {assignModal && (
        <Modal title={`Gán phòng cho: ${assignModal.guestName}`} onClose={() => { setAssignModal(null); setSelectedRoomId(""); }}>
          <div style={{ marginBottom: 14, padding: 12, background: "var(--gt-surface)", borderRadius: 8, fontSize: 13 }}>
            <div style={{ color: "var(--gt-muted)", marginBottom: 4 }}>Thông tin đặt phòng</div>
            <div><strong>{assignModal.guestName}</strong> · {assignModal.phone}</div>
            <div style={{ color: "var(--gt-muted)" }}>{assignModal.roomType} · {assignModal.checkIn} → {assignModal.checkOut}</div>
            {assignModal.preferredRoom && (
              <div style={{ marginTop: 6, padding: "6px 10px", background: "rgba(212,168,83,0.1)", borderRadius: 6, color: "var(--gt-gold)", fontSize: 12 }}>
                🏠 Khách muốn phòng: <strong>{assignModal.preferredRoom}</strong>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--gt-muted)", marginBottom: 8, fontWeight: 500 }}>
              Chọn phòng để gán ({availableRooms.length} phòng trống):
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxHeight: 240, overflowY: "auto" }}>
              {availableRooms.map(r => (
                <button key={r._id} onClick={() => setSelectedRoomId(r._id)}
                  style={{
                    padding: "10px 8px", borderRadius: 8, cursor: "pointer", textAlign: "left", fontSize: 13,
                    border: selectedRoomId === r._id ? "2px solid var(--gt-green)" : "1px solid var(--gt-border)",
                    background: selectedRoomId === r._id ? "rgba(74,222,128,0.08)" : "var(--gt-surface)",
                    color: "var(--gt-text)",
                  }}>
                  <div style={{ fontWeight: 700 }}>Phòng {r.roomNumber}</div>
                  <div style={{ fontSize: 11, color: "var(--gt-muted)" }}>{r.type} · T{r.floor}</div>
                  <div style={{ fontSize: 11, color: "var(--gt-green)" }}>{(r.pricePerNight / 1000).toFixed(0)}K/đêm</div>
                  {assignModal.preferredRoom === r.roomNumber && (
                    <div style={{ fontSize: 10, color: "var(--gt-gold)", marginTop: 2 }}>⭐ Khách muốn phòng này</div>
                  )}
                </button>
              ))}
            </div>
            {availableRooms.length === 0 && (
              <div style={{ textAlign: "center", padding: 16, color: "var(--gt-muted)", fontSize: 13 }}>
                Không có phòng trống phù hợp
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={() => { setAssignModal(null); setSelectedRoomId(""); }}>Hủy</Button>
            <Button variant="primary" onClick={handleAssignRoom} disabled={!selectedRoomId}>
              <BedDouble size={14} /> Gán phòng & Nhận khách
            </Button>
          </div>
        </Modal>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Danh sách chờ duyệt */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--gt-text)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Yêu cầu đặt phòng chờ duyệt
            <Badge variant="yellow">{pending.length}</Badge>
          </div>
          {pending.length === 0 ? (
            <p style={{ color: "var(--gt-muted)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
              Không có yêu cầu mới
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pending.map((b) => (
                <div key={b._id} style={{ border: "1px solid var(--gt-border)", borderRadius: 10, padding: 12, background: "var(--gt-surface)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{b.guestName}</div>
                      <div style={{ fontSize: 12, color: "var(--gt-muted)", marginTop: 2 }}>{b.phone} · {b.email}</div>
                      <div style={{ fontSize: 12, color: "var(--gt-muted)" }}>{b.roomType} · {b.checkIn} → {b.checkOut} · {b.guests} khách</div>
                      {/* ✅ Hiển thị phòng khách muốn */}
                      {b.preferredRoom && (
                        <div style={{ marginTop: 4, fontSize: 12, padding: "3px 8px", background: "rgba(212,168,83,0.1)", borderRadius: 5, color: "var(--gt-gold)", display: "inline-block" }}>
                          🏠 Muốn phòng: <strong>{b.preferredRoom}</strong>
                        </div>
                      )}
                      {b.notes && <div style={{ fontSize: 12, color: "var(--gt-muted)", marginTop: 2, fontStyle: "italic" }}>"{b.notes}"</div>}
                      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                        <Badge variant="yellow">{b.bookingCode}</Badge>
                        <span style={{ fontSize: 11, color: "var(--gt-muted)" }}>{new Date(b.createdAt).toLocaleString("vi-VN")}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexDirection: "column", marginLeft: 8 }}>
                      {/* ✅ Nút gán phòng trực tiếp */}
                      <Button size="sm" variant="primary" onClick={() => { setAssignModal(b); setSelectedRoomId(""); }}>
                        <BedDouble size={12} /> Gán phòng
                      </Button>
                      <Button size="sm" variant="info" onClick={() => approveBooking({ bookingId: b._id as Id<"bookings"> })}>
                        <CheckCircle size={12} /> Duyệt
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => rejectBooking({ bookingId: b._id as Id<"bookings"> })}>
                        <XCircle size={12} /> Từ chối
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lịch sử */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--gt-border)" }}>
            <div style={{ fontSize: 12, color: "var(--gt-muted)", marginBottom: 8 }}>Đã xử lý gần đây</div>
            {bookings.filter(b => b.status !== "pending").slice(0, 5).map(b => (
              <div key={b._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(30,46,30,0.3)", fontSize: 12 }}>
                <div>
                  <span>{b.guestName} · {b.roomType}</span>
                  {b.assignedRoomNumber && <span style={{ color: "var(--gt-gold)", marginLeft: 6 }}>→ P.{b.assignedRoomNumber}</span>}
                </div>
                <Badge variant={b.status === "approved" ? "green" : "red"}>
                  {b.status === "approved" ? "Đã duyệt" : "Từ chối"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Đặt phòng thủ công */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--gt-text)" }}>
            Đặt phòng thủ công
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Họ tên khách" value={manualForm.guestName} onChange={v => setManualForm(f => ({ ...f, guestName: v }))} placeholder="Nguyễn Văn A" required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Điện thoại" value={manualForm.phone} onChange={v => setManualForm(f => ({ ...f, phone: v }))} placeholder="0901234567" required />
              <Input label="Email" value={manualForm.email} onChange={v => setManualForm(f => ({ ...f, email: v }))} placeholder="email@..." />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Ngày nhận phòng" value={manualForm.checkIn} onChange={v => setManualForm(f => ({ ...f, checkIn: v }))} type="date" />
              <Input label="Ngày trả phòng" value={manualForm.checkOut} onChange={v => setManualForm(f => ({ ...f, checkOut: v }))} type="date" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Select label="Loại phòng" value={manualForm.roomType} onChange={v => setManualForm(f => ({ ...f, roomType: v }))} options={ROOM_TYPES} />
              <Input label="Số phòng muốn ở" value={manualForm.preferredRoom} onChange={v => setManualForm(f => ({ ...f, preferredRoom: v }))} placeholder="VD: 204" />
            </div>
            <Button variant="primary" onClick={handleManualBook} className="w-full justify-center">
              <CalendarPlus size={15} /> Tạo đặt phòng
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
