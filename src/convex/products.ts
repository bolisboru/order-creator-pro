import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

/**
 * The user's product catalog, newest first.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const products = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    return products.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    unit: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const name = args.name.trim();
    if (!name) throw new Error("Ürün adı boş olamaz");
    if (args.price < 0) throw new Error("Fiyat negatif olamaz");
    return await ctx.db.insert("products", {
      userId: user._id,
      name,
      price: args.price,
      unit: args.unit?.trim() || undefined,
      description: args.description?.trim() || undefined,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.string(),
    price: v.number(),
    unit: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== user._id) {
      throw new Error("Ürün bulunamadı");
    }
    const name = args.name.trim();
    if (!name) throw new Error("Ürün adı boş olamaz");
    if (args.price < 0) throw new Error("Fiyat negatif olamaz");
    await ctx.db.patch(args.id, {
      name,
      price: args.price,
      unit: args.unit?.trim() || undefined,
      description: args.description?.trim() || undefined,
    });
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== user._id) {
      throw new Error("Ürün bulunamadı");
    }
    await ctx.db.delete(args.id);
    return args.id;
  },
});
