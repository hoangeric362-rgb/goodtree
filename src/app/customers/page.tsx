"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, Badge, Button, Input, Select, Modal, Table } from "@/components/ui";
import { UserPlus, Eye, Trash2, Search, Pencil } from "lucide-react";

const statusVariant: Record<string, any> = { staying: "green", upcoming: "yellow", "checked-out": "red" };
const statusLabel: Record<string, string> = { staying: "Đang ở", upcoming: "Sắp đến", "checked-out": "Đã rời" };

export default function CustomersPage() {
  const guests = useQuery(api.guests.list) ?? [];
  const rooms = useQuery(api.rooms.list) ?? [];
  const removeGuest = useMutation(api.guests.remove);
  const updateStatus = useMutation(api.guests.updateStatus);
  const updateGuest = useMutation(api.guests.update);
  const createGuest = useMutation(api.guests.create);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modal, setModal] = useState<"add" | "view" | "edit" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});

  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    roomId: "", roomNumber: "", roomType: "Standard",
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    notes: "",
  });

  const filtered = guests.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.phone.includes(search) || g.roomNumber.includes(search);
    const matchStatus = filterStatus === "all" || g.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const availableRooms = rooms.filter((r) => r.status === "available" || r.status === "booked");
  const roomOptions = availableRooms.map((r) => ({
    value: r._id,
    label: `Phòng ${r.roomNumber} - ${r.type} (${(r.pricePerNight / 1000).toFixed(0)}K/đêm)`,
  }));

  const handleAdd = async () => {
    if (!form.name || !form.phone || !form.roomId) {
      alert("Vui lòng nhập tên, điện thoại và chọn phòng!");
      return;
    }
    try {
      await createGuest({
        name: form.name, phone: form.phone, email: form.email,
        roomId: form.roomId as Id<"rooms">,
        roomNumber: form.roomNumber, roomType: form.roomType,
        checkIn: form.checkIn, checkOut: form.checkOut,
        notes: form.notes || undefined,
      });
      setModal(null);
      setForm({ name: "", phone: "", email: "", roomId: "", roomNumber: "", roomType: "Standard", checkIn: "", checkOut: "", notes: "" });
    } catch (e) { alert("Có lỗi xảy ra!"); }
  };

  const handleEdit = async () => {
    await updateGuest({
      guestId: selected._id,
      name: editForm.name,
      phone: editForm.phone,
      email: editForm.email,
      checkIn: editForm.checkIn,
      checkOut: editForm.checkOut,
      notes: editForm.notes || undefined,
    });
    setModal(null);
    alert("Đã cập nhật thông tin khách!");
  };

  const openEdit = (g: any) => {
    setSelected(g);
    setEditForm({ name: g.name, phone: g.phone, email: g.email, checkIn: g.checkIn, checkOut: g.checkOut, notes: g.notes || "" });
    setModal("edit");
  };

  return (
    <div>
      {/* Modal Thêm */}
      {modal === "add" && (
        <Modal title="Thêm khách hàng mới" onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Họ và tên" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Nguyễn Văn A" required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Điện thoại" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="0901234567" required />
              <Input label="Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="email@..." />
            </div>
            <Select label="Phòng" value={form.roomId} required
              onChange={v => {
                const room = availableRooms.find(r => r._id === v);
                setForm(f => ({ ...f, roomId: v, roomNumber: room?.roomNumber || "", roomType: room?.type || "Standard" }));
              }}
              options={[{ value: "", label: "-- Chọn phòng --" }, ...roomOptions]} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Ngày nhận phòng" value={form.checkIn} onChange={v => setForm(f => ({ ...f, checkIn: v }))} type="date" required />
              <Input label="Ngày trả phòng" value={form.checkOut} onChange={v => setForm(f => ({ ...f, checkOut: v }))} type="date" required />
            </div>
            <Input label="Ghi chú" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Yêu cầu đặc biệt..." />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
            <Button variant="outline" onClick={() => setModal(null)}>Hủy</Button>
            <Button variant="primary" onClick={handleAdd}><UserPlus size={14} /> Thêm khách</Button>
          </div>
        </Modal>
      )}

      {/* Modal Xem */}
      {modal === "view" && selected && (
        <Modal title="Thông tin khách hàng" onClose={() => setModal(null)}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--gt-green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#000" }}>
              {selected.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{selected.name}</div>
              <Badge variant={statusVariant[selected.status]}>{statusLabel[selected.status]}</Badge>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[["Điện thoại", selected.phone], ["Email", selected.email || "—"], ["Số phòng", selected.roomNumber], ["Loại phòng", selected.roomType], ["Nhận phòng", selected.checkIn], ["Trả phòng", selected.checkOut]].map(([label, value]) => (
              <div key={label} style={{ background: "var(--gt-surface)", borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 11, color: "var(--gt-muted)" }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "var(--gt-muted)", marginBottom: 6 }}>Cập nhật trạng thái</div>
            <div style={{ display: "flex", gap: 6 }}>
              {(["upcoming", "staying", "checked-out"] as const).map(s => (
                <button key={s} onClick={() => { updateStatus({ guestId: selected._id, status: s }); setModal(null); }}
                  style={{ flex: 1, padding: "7px", border: selected.status === s ? "2px solid var(--gt-green)" : "1px solid var(--gt-border)", borderRadius: 8, background: selected.status === s ? "rgba(74,222,128,0.1)" : "var(--gt-surface)", color: "var(--gt-text)", cursor: "pointer", fontSize: 12 }}>
                  {statusLabel[s]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button variant="info" size="sm" onClick={() => openEdit(selected)}>
              <Pencil size={13} /> Chỉnh sửa
            </Button>
            <Button variant="danger" size="sm" onClick={async () => { if (confirm("Xóa khách này?")) { await removeGuest({ guestId: selected._id }); setModal(null); } }}>
              <Trash2 size={13} /> Xóa
            </Button>
            <Button variant="outline" onClick={() => setModal(null)}>Đóng</Button>
          </div>
        </Modal>
      )}

      {/* ✅ Modal Chỉnh sửa */}
      {modal === "edit" && selected && (
        <Modal title={`Chỉnh sửa: ${selected.name}`} onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Họ và tên" value={editForm.name} onChange={v => setEditForm((f: any) => ({ ...f, name: v }))} required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Điện thoại" value={editForm.phone} onChange={v => setEditForm((f: any) => ({ ...f, phone: v }))} required />
              <Input label="Email" value={editForm.email} onChange={v => setEditForm((f: any) => ({ ...f, email: v }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Ngày nhận phòng" value={editForm.checkIn} onChange={v => setEditForm((f: any) => ({ ...f, checkIn: v }))} type="date" />
              <Input label="Ngày trả phòng" value={editForm.checkOut} onChange={v => setEditForm((f: any) => ({ ...f, checkOut: v }))} type="date" />
            </div>
            <Input label="Ghi chú" value={editForm.notes} onChange={v => setEditForm((f: any) => ({ ...f, notes: v }))} placeholder="Ghi chú..." />
            <div style={{ padding: 10, background: "var(--gt-surface)", borderRadius: 8, fontSize: 12, color: "var(--gt-muted)" }}>
              Phòng: <strong style={{ color: "var(--gt-text)" }}>{selected.roomNumber}</strong> ({selected.roomType}) — Không thể đổi phòng ở đây
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
            <Button variant="outline" onClick={() => setModal(null)}>Hủy</Button>
            <Button variant="primary" onClick={handleEdit}><Pencil size={14} /> Lưu thay đổi</Button>
          </div>
        </Modal>
      )}

      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--gt-text)" }}>
            Danh sách khách hàng ({filtered.length})
          </h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--gt-muted)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tìm tên, SĐT, phòng..."
                style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: "var(--gt-surface)", border: "1px solid var(--gt-border)", borderRadius: 8, color: "var(--gt-text)", fontSize: 13, outline: "none", width: 200 }} />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: "8px 12px", background: "var(--gt-surface)", border: "1px solid var(--gt-border)", borderRadius: 8, color: "var(--gt-text)", fontSize: 13, outline: "none" }}>
              <option value="all">Tất cả</option>
              <option value="staying">Đang ở</option>
              <option value="upcoming">Sắp đến</option>
              <option value="checked-out">Đã rời</option>
            </select>
            <Button variant="primary" size="sm" onClick={() => setModal("add")}>
              <UserPlus size={14} /> Thêm khách
            </Button>
          </div>
        </div>

        <Table headers={["Khách hàng", "Liên hệ", "Phòng", "Loại phòng", "Nhận phòng", "Trả phòng", "Trạng thái", ""]}>
          {filtered.map((g) => (
            <tr key={g._id} style={{ borderBottom: "1px solid rgba(30,46,30,0.5)" }} className="hover:bg-white/[0.02] transition-colors">
              <td style={{ padding: "10px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--gt-green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#000" }}>
                    {g.name.charAt(0)}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{g.name}</span>
                </div>
              </td>
              <td style={{ padding: "10px 12px" }}>
                <div style={{ fontSize: 12, color: "var(--gt-muted)" }}>{g.phone}</div>
                <div style={{ fontSize: 12, color: "var(--gt-info)" }}>{g.email || "—"}</div>
              </td>
              <td style={{ padding: "10px 12px" }}><Badge variant="blue">{g.roomNumber}</Badge></td>
              <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--gt-muted)" }}>{g.roomType}</td>
              <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--gt-muted)" }}>{g.checkIn}</td>
              <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--gt-muted)" }}>{g.checkOut}</td>
              <td style={{ padding: "10px 12px" }}>
                <Badge variant={statusVariant[g.status]}>{statusLabel[g.status]}</Badge>
              </td>
              <td style={{ padding: "10px 12px" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  <Button size="sm" variant="outline" onClick={() => { setSelected(g); setModal("view"); }}>
                    <Eye size={12} />
                  </Button>
                  <Button size="sm" variant="info" onClick={() => openEdit(g)}>
                    <Pencil size={12} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "30px 0", color: "var(--gt-muted)", fontSize: 13 }}>
            Không tìm thấy khách hàng nào
          </div>
        )}
      </Card>
    </div>
  );
}
