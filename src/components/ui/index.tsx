"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl p-4", className)}
      style={{ background: "var(--gt-card)", border: "1px solid var(--gt-border)" }}>
      {children}
    </div>
  );
}

export function StatCard({
  value, label, change, valueColor,
}: {
  value: string; label: string; change?: string; valueColor?: string;
}) {
  return (
    <Card>
      <div className="text-2xl font-bold" style={{ color: valueColor || "var(--gt-green)" }}>
        {value}
      </div>
      <div className="text-xs mt-1" style={{ color: "var(--gt-muted)" }}>{label}</div>
      {change && (
        <div className="text-xs mt-1" style={{ color: "var(--gt-green2)" }}>{change}</div>
      )}
    </Card>
  );
}

export function Badge({
  children, variant = "green",
}: {
  children: ReactNode;
  variant?: "green" | "yellow" | "blue" | "red" | "purple" | "gold";
}) {
  const styles: Record<string, React.CSSProperties> = {
    green: { background: "rgba(74,222,128,0.1)", color: "var(--gt-green)" },
    yellow: { background: "rgba(251,191,36,0.1)", color: "var(--gt-warning)" },
    blue: { background: "rgba(96,165,250,0.1)", color: "var(--gt-info)" },
    red: { background: "rgba(248,113,113,0.1)", color: "var(--gt-danger)" },
    purple: { background: "rgba(167,139,250,0.1)", color: "#a78bfa" },
    gold: { background: "rgba(212,168,83,0.1)", color: "var(--gt-gold)" },
  };
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={styles[variant]}>
      {children}
    </span>
  );
}

export function Button({
  children, onClick, variant = "primary", size = "md", disabled, className, type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "danger" | "warning" | "info" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: "var(--gt-green2)", color: "#000", border: "none" },
    outline: { background: "transparent", color: "var(--gt-muted)", border: "1px solid var(--gt-border)" },
    danger: { background: "rgba(248,113,113,0.1)", color: "var(--gt-danger)", border: "1px solid rgba(248,113,113,0.3)" },
    warning: { background: "rgba(251,191,36,0.1)", color: "var(--gt-warning)", border: "1px solid rgba(251,191,36,0.3)" },
    info: { background: "rgba(96,165,250,0.1)", color: "var(--gt-info)", border: "1px solid rgba(96,165,250,0.3)" },
    ghost: { background: "transparent", color: "var(--gt-muted)", border: "none" },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn("rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5", sizes[size], className)}
      style={{ ...variants[variant], opacity: disabled ? 0.5 : 1 }}>
      {children}
    </button>
  );
}

export function Input({
  label, value, onChange, placeholder, type = "text", required,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gt-muted)" }}>
          {label}{required && <span style={{ color: "var(--gt-danger)" }}> *</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
        style={{
          background: "var(--gt-surface)",
          border: "1px solid var(--gt-border)",
          color: "var(--gt-text)",
        }}
        onFocus={e => { e.target.style.borderColor = "var(--gt-green2)"; }}
        onBlur={e => { e.target.style.borderColor = "var(--gt-border)"; }}
      />
    </div>
  );
}

export function Select({
  label, value, onChange, options, required,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--gt-muted)" }}>
          {label}{required && <span style={{ color: "var(--gt-danger)" }}> *</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
        style={{
          background: "var(--gt-surface)",
          border: "1px solid var(--gt-border)",
          color: "var(--gt-text)",
        }}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function Modal({
  title, onClose, children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl p-6"
        style={{ background: "var(--gt-card)", border: "1px solid var(--gt-border)" }}>
        <h2 className="text-base font-semibold mb-5" style={{ color: "var(--gt-text)" }}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

export function Table({
  headers, children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className="text-left px-3 py-2.5 text-xs font-medium tracking-wide"
                style={{ color: "var(--gt-muted)", borderBottom: "1px solid var(--gt-border)" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
