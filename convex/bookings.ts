import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bookings").order("desc").collect();
  },
});

export const getPending = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

export const create = mutation({
  args: {
    guestName: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    roomType: v.string(),
    preferredRoom: v.optional(v.string()),
    checkIn: v.string(),
    checkOut: v.string(),
    guests: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const code = "BK" + Math.random().toString(36).slice(2, 7).toUpperCase();
    return await ctx.db.insert("bookings", {
      ...args,
      bookingCode: code,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const approve = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, { status: "approved" });
    return { success: true };
  },
});

export const reject = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, { status: "rejected" });
    return { success: true };
  },
});

// ✅ Admin gán phòng cho booking + tạo guest record luôn
export const assignRoomAndCheckIn = mutation({
  args: {
    bookingId: v.id("bookings"),
    roomId: v.id("rooms"),
    roomNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) return { success: false, message: "Không tìm thấy booking!" };

    // Cập nhật booking: gán phòng + approved
    await ctx.db.patch(args.bookingId, {
      status: "approved",
      assignedRoomId: args.roomId,
      assignedRoomNumber: args.roomNumber,
    });

    // Cập nhật trạng thái phòng -> booked
    await ctx.db.patch(args.roomId, { status: "booked" });

    // Tạo guest record
    await ctx.db.insert("guests", {
      name: booking.guestName,
      phone: booking.phone,
      email: booking.email,
      roomId: args.roomId,
      roomNumber: args.roomNumber,
      roomType: booking.roomType,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      notes: booking.notes,
      status: "upcoming",
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
