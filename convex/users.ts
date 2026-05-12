import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    role: v.optional(v.union(v.literal("admin"), v.literal("guest"))),
  },
  handler: async (ctx, args) => {
    await seedAdminInternal(ctx);

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    // ✅ ADMIN: không cần mật khẩu - chỉ cần chọn role admin
    if (args.role === "admin") {
      const adminUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();

      // Nếu email có trong DB và là admin thì cho vào
      if (adminUser && adminUser.role === "admin") {
        return {
          success: true,
          user: {
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
          },
        };
      }

      // Nếu không tìm thấy email, cho phép đăng nhập với tài khoản admin mặc định
      // (trường hợp admin chọn tab admin và bấm đăng nhập không cần nhập gì)
      const defaultAdmin = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("role"), "admin"))
        .first();

      if (defaultAdmin) {
        return {
          success: true,
          user: {
            id: defaultAdmin._id,
            name: defaultAdmin.name,
            email: defaultAdmin.email,
            role: defaultAdmin.role,
          },
        };
      }
    }

    // ✅ KHÁCH: phải nhập đúng email + mật khẩu
    if (!user || user.password !== args.password) {
      return { success: false, message: "Sai tài khoản hoặc mật khẩu!" };
    }

    return {
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },
});

export const loginAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    await seedAdminInternal(ctx);

    const adminUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .first();

    if (!adminUser) {
      return { success: false, message: "Không tìm thấy tài khoản admin!" };
    }

    return {
      success: true,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    };
  },
});

export const registerGuest = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      return { success: false, message: "Email đã được sử dụng!" };
    }

    const id = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: args.password,
      role: "guest",
      createdAt: Date.now(),
    });

    return { success: true, userId: id };
  },
});

// Helper nội bộ (không export)
async function seedAdminInternal(ctx: any) {
  const existing = await ctx.db
    .query("users")
    .withIndex("by_email", (q: any) => q.eq("email", "admin@goodtree.com"))
    .first();

  if (existing) return;

  await ctx.db.insert("users", {
    name: "Admin GOODTREE",
    email: "admin@goodtree.com",
    password: "admin123",
    role: "admin",
    createdAt: Date.now(),
  });
}

export const seedAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    await seedAdminInternal(ctx);
  },
});
