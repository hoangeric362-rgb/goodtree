"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { TreePine, Shield, User, Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const loginMutation = useMutation(api.users.login);
  const loginAdminMutation = useMutation(api.users.loginAdmin);
  const registerMutation = useMutation(api.users.registerGuest);
  const seedRooms = useMutation(api.rooms.seed);

  const [role, setRole] = useState<"admin" | "guest">("admin");
  const [isRegister, setIsRegister] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", password: "",
  });

  // ✅ ADMIN: đăng nhập không cần tài khoản / mật khẩu
  const handleAdminLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await seedRooms();
      const result = await loginAdminMutation({});
      if (result.success && result.user) {
        login({
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        });
        router.push("/dashboard");
      } else {
        setError(result.message || "Đăng nhập admin thất bại!");
      }
    } catch (e) {
      setError("Có lỗi xảy ra, thử lại sau!");
    }
    setLoading(false);
  };

  // ✅ KHÁCH: phải nhập email + mật khẩu
  const handleGuestLogin = async () => {
    if (!form.email || !form.password) {
      setError("Vui lòng nhập email và mật khẩu!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await seedRooms();
      const result = await loginMutation({
        email: form.email,
        password: form.password,
        role: "guest",
      });
      if (result.success && result.user) {
        login({
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        });
        router.push("/booking");
      } else {
        setError(result.message || "Đăng nhập thất bại!");
      }
    } catch (e) {
      setError("Có lỗi xảy ra, thử lại sau!");
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await registerMutation({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      if (result.success) {
        setIsRegister(false);
        setError("");
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
      } else {
        setError(result.message || "Đăng ký thất bại!");
      }
    } catch (e) {
      setError("Có lỗi xảy ra!");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--gt-bg)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TreePine size={36} color="var(--gt-green)" />
            <span
              className="text-4xl font-black tracking-widest"
              style={{ color: "var(--gt-green)" }}
            >
              GOODTREE
            </span>
          </div>
          <div
            className="text-xs tracking-widest"
            style={{ color: "var(--gt-muted)" }}
          >
            HOTEL MANAGEMENT SYSTEM
          </div>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: "var(--gt-card)",
            border: "1px solid var(--gt-border)",
          }}
        >
          {/* Role Switch */}
          <div
            className="flex rounded-xl p-1 mb-6 gap-1"
            style={{ background: "var(--gt-surface)" }}
          >
            <button
              onClick={() => {
                setRole("admin");
                setError("");
                setIsRegister(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                role === "admin"
                  ? { background: "var(--gt-green2)", color: "#000" }
                  : { color: "var(--gt-muted)", background: "transparent" }
              }
            >
              <Shield size={14} /> Admin
            </button>
            <button
              onClick={() => {
                setRole("guest");
                setError("");
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                role === "guest"
                  ? { background: "var(--gt-info)", color: "#000" }
                  : { color: "var(--gt-muted)", background: "transparent" }
              }
            >
              <User size={14} /> Khách hàng
            </button>
          </div>

          {/* ====== ADMIN PANEL: không cần tài khoản mật khẩu ====== */}
          {role === "admin" && (
            <div>
              <div
                className="mb-6 p-4 rounded-xl text-center"
                style={{
                  background: "rgba(212,168,83,0.08)",
                  border: "1px solid rgba(212,168,83,0.25)",
                }}
              >
                <div
                  className="text-2xl mb-2"
                  style={{ color: "var(--gt-gold)" }}
                >
                  <Shield
                    size={32}
                    style={{ display: "inline", marginBottom: 4 }}
                  />
                </div>
                <div
                  className="text-sm font-semibold mb-1"
                  style={{ color: "var(--gt-gold)" }}
                >
                  Đăng nhập Admin
                </div>
                <div
                  className="text-xs"
                  style={{ color: "var(--gt-muted)" }}
                >
                  Tài khoản quản trị viên — không cần mật khẩu
                </div>
              </div>

              {error && (
                <div
                  className="mb-4 p-2.5 rounded-lg text-xs"
                  style={{
                    background: "rgba(248,113,113,0.1)",
                    color: "var(--gt-danger)",
                    border: "1px solid rgba(248,113,113,0.2)",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                onClick={handleAdminLogin}
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                style={{
                  background: "var(--gt-green2)",
                  color: "#000",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <LogIn size={16} />
                {loading ? "Đang đăng nhập..." : "Vào hệ thống Admin"}
              </button>
            </div>
          )}

          {/* ====== GUEST PANEL: cần email + mật khẩu ====== */}
          {role === "guest" && (
            <div>
              <div className="space-y-4">
                {isRegister && (
                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--gt-muted)" }}
                    >
                      Họ và tên
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="Nguyễn Văn A"
                      className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                      style={{
                        background: "var(--gt-surface)",
                        border: "1px solid var(--gt-border)",
                        color: "var(--gt-text)",
                      }}
                    />
                  </div>
                )}
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--gt-muted)" }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="email@example.com"
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (isRegister ? handleRegister() : handleGuestLogin())
                    }
                    style={{
                      background: "var(--gt-surface)",
                      border: "1px solid var(--gt-border)",
                      color: "var(--gt-text)",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--gt-muted)" }}
                  >
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, password: e.target.value }))
                      }
                      placeholder="••••••••"
                      className="w-full rounded-lg px-3 py-2.5 text-sm outline-none pr-10"
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (isRegister ? handleRegister() : handleGuestLogin())
                      }
                      style={{
                        background: "var(--gt-surface)",
                        border: "1px solid var(--gt-border)",
                        color: "var(--gt-text)",
                      }}
                    />
                    <button
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--gt-muted)" }}
                    >
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div
                  className="mt-3 p-2.5 rounded-lg text-xs"
                  style={{
                    background: "rgba(248,113,113,0.1)",
                    color: "var(--gt-danger)",
                    border: "1px solid rgba(248,113,113,0.2)",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                onClick={isRegister ? handleRegister : handleGuestLogin}
                disabled={loading}
                className="w-full mt-5 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: "var(--gt-info)",
                  color: "#000",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading
                  ? "Đang xử lý..."
                  : isRegister
                  ? "Đăng ký"
                  : "Đăng nhập"}
              </button>

              <div
                className="mt-4 text-center text-xs"
                style={{ color: "var(--gt-muted)" }}
              >
                {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
                <button
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError("");
                  }}
                  className="font-medium"
                  style={{ color: "var(--gt-green)" }}
                >
                  {isRegister ? "Đăng nhập" : "Đăng ký"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
