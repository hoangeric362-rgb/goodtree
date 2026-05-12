"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, Badge, Button, Table } from "@/components/ui";
import { formatVND } from "@/lib/utils";

const TABS = [
  { id: "pricing", label: "Bảng giá" },
  { id: "qr", label: "Thanh toán QR" },
  { id: "paypal", label: "PayPal" },
  { id: "history", label: "Lịch sử" },
];

const ROOM_TYPES = [
  {
    name: "Standard", price: 800000, icon: "🛏️",
    features: ["Diện tích 25m²", "1 giường đôi", "Wifi miễn phí", "Điều hòa", 'TV 42"', "Phòng tắm riêng"],
  },
  {
    name: "Deluxe", price: 1200000, icon: "✨",
    features: ["Diện tích 35m²", "1 giường King", "Wifi miễn phí", "Mini bar", "Bathtub", 'TV 55"'],
  },
  {
    name: "Suite", price: 2500000, icon: "🏆",
    features: ["Diện tích 55m²", "Phòng khách riêng", "Bồn tắm Jacuzzi", "View hồ bơi", "Dịch vụ 24/7"],
    popular: true,
  },
  {
    name: "Presidential", price: 5000000, icon: "👑",
    features: ["Diện tích 100m²", "3 phòng ngủ", "Bếp riêng", "Butler riêng", "Đón sân bay", "Spa miễn phí"],
  },
];

export default function PaymentPage() {
  const [tab, setTab] = useState("pricing");
  const payments = useQuery(api.payments.list) ?? [];

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500,
              background: tab === t.id ? "rgba(74,222,128,0.1)" : "transparent",
              color: tab === t.id ? "var(--gt-green)" : "var(--gt-muted)",
              border: tab === t.id ? "1px solid rgba(74,222,128,0.3)" : "1px solid transparent",
              transition: "all .15s",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "pricing" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {ROOM_TYPES.map((r) => (
            <div key={r.name} style={{
              background: "var(--gt-card)", border: r.popular ? "2px solid var(--gt-green2)" : "1px solid var(--gt-border)",
              borderRadius: 14, padding: 20, textAlign: "center", position: "relative",
            }}>
              {r.popular && (
                <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "var(--gt-green2)", color: "#000", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                  PHỔ BIẾN NHẤT
                </div>
              )}
              <div style={{ fontSize: 28, marginBottom: 6 }}>{r.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gt-text)" }}>{r.name}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--gt-green)", margin: "10px 0 4px" }}>
                {formatVND(r.price)}
              </div>
              <div style={{ fontSize: 11, color: "var(--gt-muted)", marginBottom: 14 }}>mỗi đêm / phòng</div>
              <ul style={{ listStyle: "none", textAlign: "left" }}>
                {r.features.map((f) => (
                  <li key={f} style={{ display: "flex", gap: 6, fontSize: 12, color: "var(--gt-muted)", padding: "5px 0", borderBottom: "1px solid var(--gt-border)" }}>
                    <span style={{ color: "var(--gt-green)" }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => {}}
                style={{ width: "100%", padding: "10px", marginTop: 14, background: r.popular ? "var(--gt-green2)" : "transparent", color: r.popular ? "#000" : "var(--gt-green)", border: r.popular ? "none" : "1px solid var(--gt-green)", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                Đặt ngay
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "qr" && (
        <div style={{ maxWidth: 420, margin: "0 auto" }}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Thanh toán QR Code</div>
              <div style={{ fontSize: 12, color: "var(--gt-muted)", marginBottom: 20 }}>
                Quét mã QR để thanh toán qua các ứng dụng ngân hàng Việt Nam
              </div>
              {/* QR Code SVG */}
              <div style={{ width: 160, height: 160, background: "white", borderRadius: 12, padding: 10, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <rect x="5" y="5" width="50" height="50" fill="none" stroke="#000" strokeWidth="4"/>
                  <rect x="15" y="15" width="30" height="30" fill="#000"/>
                  <rect x="85" y="5" width="50" height="50" fill="none" stroke="#000" strokeWidth="4"/>
                  <rect x="95" y="15" width="30" height="30" fill="#000"/>
                  <rect x="5" y="85" width="50" height="50" fill="none" stroke="#000" strokeWidth="4"/>
                  <rect x="15" y="95" width="30" height="30" fill="#000"/>
                  <rect x="65" y="65" width="10" height="10" fill="#000"/>
                  <rect x="80" y="65" width="10" height="10" fill="#000"/>
                  <rect x="95" y="65" width="10" height="10" fill="#000"/>
                  <rect x="110" y="65" width="10" height="10" fill="#000"/>
                  <rect x="125" y="65" width="10" height="10" fill="#000"/>
                  <rect x="65" y="80" width="10" height="10" fill="#000"/>
                  <rect x="80" y="80" width="10" height="10" fill="#000"/>
                  <rect x="95" y="95" width="10" height="10" fill="#000"/>
                  <rect x="110" y="80" width="10" height="10" fill="#000"/>
                  <rect x="65" y="95" width="10" height="10" fill="#000"/>
                  <rect x="80" y="95" width="10" height="10" fill="#000"/>
                  <rect x="110" y="95" width="10" height="10" fill="#000"/>
                  <rect x="125" y="95" width="10" height="10" fill="#000"/>
                  <rect x="65" y="110" width="10" height="10" fill="#000"/>
                  <rect x="80" y="110" width="20" height="10" fill="#000"/>
                  <rect x="110" y="110" width="10" height="10" fill="#000"/>
                  <rect x="125" y="110" width="10" height="10" fill="#000"/>
                  <rect x="65" y="125" width="20" height="10" fill="#000"/>
                  <rect x="95" y="125" width="10" height="10" fill="#000"/>
                  <rect x="115" y="125" width="20" height="10" fill="#000"/>
                </svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gt-green)", marginBottom: 4 }}>GOODTREE HOTEL & RESORT</div>
              <div style={{ fontSize: 12, color: "var(--gt-muted)", marginBottom: 2 }}>STK: 1234 5678 9012 3456</div>
              <div style={{ fontSize: 12, color: "var(--gt-muted)", marginBottom: 16 }}>Ngân hàng: BIDV - Chi nhánh Biên Hòa</div>
              <div style={{ padding: 12, background: "var(--gt-surface)", borderRadius: 8, fontSize: 12, color: "var(--gt-muted)" }}>
                Hỗ trợ: <strong style={{ color: "var(--gt-text)" }}>VietQR, MoMo, ZaloPay, VNPay</strong><br />
                và tất cả ngân hàng tại Việt Nam
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === "paypal" && (
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Thanh toán PayPal</div>
              <div style={{ fontSize: 12, color: "var(--gt-muted)", marginBottom: 16 }}>
                Thanh toán quốc tế an toàn qua PayPal
              </div>
              <div style={{ background: "#003087", borderRadius: 10, padding: "16px 20px", marginBottom: 16 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontStyle: "italic" }}>
                  Pay<span style={{ color: "#009cde" }}>Pal</span>
                </div>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "var(--gt-muted)", marginBottom: 5, fontWeight: 500 }}>Email PayPal</div>
                  <input readOnly value="payments@goodtreehotel.com" style={{ width: "100%", background: "var(--gt-surface)", border: "1px solid var(--gt-border)", borderRadius: 8, padding: "9px 12px", color: "var(--gt-text)", fontSize: 13, outline: "none" }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "var(--gt-muted)", marginBottom: 5, fontWeight: 500 }}>Số tiền (USD)</div>
                  <input type="number" placeholder="50.00" style={{ width: "100%", background: "var(--gt-surface)", border: "1px solid var(--gt-border)", borderRadius: 8, padding: "9px 12px", color: "var(--gt-text)", fontSize: 13, outline: "none" }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "var(--gt-muted)", marginBottom: 5, fontWeight: 500 }}>Ghi chú</div>
                  <input placeholder="Đặt phòng #..." style={{ width: "100%", background: "var(--gt-surface)", border: "1px solid var(--gt-border)", borderRadius: 8, padding: "9px 12px", color: "var(--gt-text)", fontSize: 13, outline: "none" }} />
                </div>
              </div>
              <button onClick={() => alert("Chuyển hướng đến PayPal...")}
                style={{ width: "100%", padding: "12px", background: "#009cde", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Thanh toán với PayPal
              </button>
              <div style={{ fontSize: 11, color: "var(--gt-muted)", marginTop: 10 }}>
                Tỷ giá tham khảo: 1 USD ≈ 25,500 VNĐ
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === "history" && (
        <Card>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--gt-text)" }}>
            Lịch sử giao dịch ({payments.length})
          </h2>
          <Table headers={["Mã GD", "Khách hàng", "Phòng", "Số tiền", "Phương thức", "Ngày", "Trạng thái"]}>
            {payments.map((p) => (
              <tr key={p._id} style={{ borderBottom: "1px solid rgba(30,46,30,0.5)" }}>
                <td style={{ padding: "10px 12px" }}>
                  <code style={{ fontSize: 12, color: "var(--gt-green)", background: "rgba(74,222,128,0.08)", padding: "2px 6px", borderRadius: 5 }}>{p.transactionId}</code>
                </td>
                <td style={{ padding: "10px 12px", fontSize: 13 }}>{p.guestName}</td>
                <td style={{ padding: "10px 12px" }}><Badge variant="blue">{p.roomNumber}</Badge></td>
                <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600 }}>{formatVND(p.amount)}</td>
                <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--gt-muted)" }}>
                  {p.method === "qr" ? "QR Code" : p.method === "paypal" ? "PayPal" : p.method === "cash" ? "Tiền mặt" : "Thẻ"}
                </td>
                <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--gt-muted)" }}>
                  {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <Badge variant={p.status === "paid" ? "green" : p.status === "pending" ? "yellow" : "red"}>
                    {p.status === "paid" ? "Đã TT" : p.status === "pending" ? "Chờ TT" : "Hoàn tiền"}
                  </Badge>
                </td>
              </tr>
            ))}
          </Table>
          {payments.length === 0 && (
            <div style={{ textAlign: "center", padding: "30px 0", color: "var(--gt-muted)", fontSize: 13 }}>
              Chưa có giao dịch nào
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
