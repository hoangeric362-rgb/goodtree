import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rooms").collect();
  },
});

export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_status", (q) => q.eq("status", args.status as any))
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    roomId: v.id("rooms"),
    status: v.union(
      v.literal("available"),
      v.literal("occupied"),
      v.literal("booked"),
      v.literal("cleaning"),
      v.literal("repair")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.roomId, { status: args.status });
    return { success: true };
  },
});

export const create = mutation({
  args: {
    roomNumber: v.string(),
    type: v.union(
      v.literal("Standard"),
      v.literal("Deluxe"),
      v.literal("Suite"),
      v.literal("Presidential")
    ),
    floor: v.number(),
    pricePerNight: v.number(),
    description: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rooms", {
      ...args,
      status: "available",
    });
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("rooms").collect();
    if (existing.length > 0) return;

    const roomsData = [
      { roomNumber: "101", type: "Standard" as const, floor: 1, pricePerNight: 800000 },
      { roomNumber: "102", type: "Standard" as const, floor: 1, pricePerNight: 800000 },
      { roomNumber: "103", type: "Standard" as const, floor: 1, pricePerNight: 800000 },
      { roomNumber: "104", type: "Standard" as const, floor: 1, pricePerNight: 800000 },
      { roomNumber: "105", type: "Deluxe" as const, floor: 1, pricePerNight: 1200000 },
      { roomNumber: "201", type: "Deluxe" as const, floor: 2, pricePerNight: 1200000 },
      { roomNumber: "202", type: "Deluxe" as const, floor: 2, pricePerNight: 1200000 },
      { roomNumber: "203", type: "Deluxe" as const, floor: 2, pricePerNight: 1200000 },
      { roomNumber: "204", type: "Suite" as const, floor: 2, pricePerNight: 2500000 },
      { roomNumber: "205", type: "Suite" as const, floor: 2, pricePerNight: 2500000 },
      { roomNumber: "301", type: "Suite" as const, floor: 3, pricePerNight: 2500000 },
      { roomNumber: "302", type: "Suite" as const, floor: 3, pricePerNight: 2500000 },
      { roomNumber: "303", type: "Presidential" as const, floor: 3, pricePerNight: 5000000 },
      { roomNumber: "304", type: "Presidential" as const, floor: 3, pricePerNight: 5000000 },
      { roomNumber: "305", type: "Presidential" as const, floor: 3, pricePerNight: 5000000 },
    ];

    for (const room of roomsData) {
      await ctx.db.insert("rooms", { ...room, status: "available" });
    }
  },
});
