import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

export const ROOM_PRICES = {
  Standard: 800000,
  Deluxe: 1200000,
  Suite: 2500000,
  Presidential: 5000000,
};

export const STATUS_LABELS: Record<string, string> = {
  available: "Trống",
  occupied: "Có khách",
  booked: "Đã đặt",
  cleaning: "Đang dọn",
  repair: "Sửa chữa",
};

export const STATUS_COLORS: Record<string, string> = {
  available: "text-green-400 bg-green-400/10",
  occupied: "text-blue-400 bg-blue-400/10",
  booked: "text-yellow-400 bg-yellow-400/10",
  cleaning: "text-purple-400 bg-purple-400/10",
  repair: "text-red-400 bg-red-400/10",
};

export function calcNights(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000));
}
