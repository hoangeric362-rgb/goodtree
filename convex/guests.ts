import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("guests").order("desc").collect();
  },
});

export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("guests")
      .withIndex("by_status", (q) => q.eq("status", args.status as any))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    roomId: v.id("rooms"),
    roomNumber: v.string(),
    roomType: v.string(),
    checkIn: v.string(),
    checkOut: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.roomId, { status: "occupied" });
    return await ctx.db.insert("guests", {
      ...args,
      status: "upcoming",
      createdAt: Date.now(),
    });
  },
});

// ✅ Admin chỉnh sửa thông tin khách
export const update = mutation({
  args: {
    guestId: v.id("guests"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    checkIn: v.optional(v.string()),
    checkOut: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { guestId, ...fields } = args;
    const updates: any = {};
    if (fields.name !== undefined) updates.name = fields.name;
    if (fields.phone !== undefined) updates.phone = fields.phone;
    if (fields.email !== undefined) updates.email = fields.email;
    if (fields.checkIn !== undefined) updates.checkIn = fields.checkIn;
    if (fields.checkOut !== undefined) updates.checkOut = fields.checkOut;
    if (fields.notes !== undefined) updates.notes = fields.notes;
    await ctx.db.patch(guestId, updates);
    return { success: true };
  },
});

export const updateStatus = mutation({
  args: {
    guestId: v.id("guests"),
    status: v.union(
      v.literal("upcoming"),
      v.literal("staying"),
      v.literal("checked-out")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.guestId, { status: args.status });
    return { success: true };
  },
});

export const remove = mutation({
  args: { guestId: v.id("guests") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.guestId);
    return { success: true };
  },
});
