import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("guest")),
    password: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  rooms: defineTable({
    roomNumber: v.string(),
    type: v.union(
      v.literal("Standard"),
      v.literal("Deluxe"),
      v.literal("Suite"),
      v.literal("Presidential")
    ),
    floor: v.number(),
    status: v.union(
      v.literal("available"),
      v.literal("occupied"),
      v.literal("booked"),
      v.literal("cleaning"),
      v.literal("repair")
    ),
    pricePerNight: v.number(),
    description: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
  }).index("by_status", ["status"]),

  guests: defineTable({
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    roomId: v.id("rooms"),
    roomNumber: v.string(),
    roomType: v.string(),
    checkIn: v.string(),
    checkOut: v.string(),
    status: v.union(
      v.literal("upcoming"),
      v.literal("staying"),
      v.literal("checked-out")
    ),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  bookings: defineTable({
    bookingCode: v.string(),
    guestName: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    roomType: v.string(),
    preferredRoom: v.optional(v.string()),
    checkIn: v.string(),
    checkOut: v.string(),
    guests: v.number(),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    assignedRoomId: v.optional(v.id("rooms")),
    assignedRoomNumber: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  payments: defineTable({
    transactionId: v.string(),
    guestId: v.optional(v.id("guests")),
    guestName: v.string(),
    roomNumber: v.string(),
    amount: v.number(),
    method: v.union(
      v.literal("cash"),
      v.literal("qr"),
      v.literal("paypal"),
      v.literal("card")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("refunded")
    ),
    createdAt: v.number(),
  }).index("by_status", ["status"]),
});
