import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("payments").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    guestName: v.string(),
    roomNumber: v.string(),
    amount: v.number(),
    method: v.union(
      v.literal("cash"),
      v.literal("qr"),
      v.literal("paypal"),
      v.literal("card")
    ),
    guestId: v.optional(v.id("guests")),
  },
  handler: async (ctx, args) => {
    const txId = "TX" + Math.random().toString(36).slice(2, 8).toUpperCase();
    return await ctx.db.insert("payments", {
      ...args,
      transactionId: txId,
      status: "paid",
      createdAt: Date.now(),
    });
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const payments = await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("status"), "paid"))
      .collect();

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const today = new Date().toDateString();
    const todayTotal = payments
      .filter((p) => new Date(p.createdAt).toDateString() === today)
      .reduce((sum, p) => sum + p.amount, 0);

    return { total, todayTotal, count: payments.length };
  },
});
