import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getCurrentUser } from "../users";

/**
 * Customer-specific prices (müşteriye özel fiyat).
 * Exposed to the client as `api.customers.prices.*`.
 */

/** All special prices for the user (frontend joins by customer/product). */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("customerPrices")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

/** Create or update one customer-specific price. */
export const set = mutation({
  args: {
    customerId: v.id("customers"),
    productId: v.id("products"),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    if (args.price < 0) throw new Error("Fiyat negatif olamaz");
    const customer = await ctx.db.get(args.customerId);
    if (!customer || customer.userId !== user._id) {
      throw new Error("Müşteri bulunamadı");
    }
    const product = await ctx.db.get(args.productId);
    if (!product || product.userId !== user._id) {
      throw new Error("Ürün bulunamadı");
    }
    const existing = await ctx.db
      .query("customerPrices")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(
          q.eq(q.field("customerId"), args.customerId),
          q.eq(q.field("productId"), args.productId),
        ),
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { price: args.price });
      return existing._id;
    }
    return await ctx.db.insert("customerPrices", {
      userId: user._id,
      customerId: args.customerId,
      productId: args.productId,
      price: args.price,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("customerPrices") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== user._id) {
      throw new Error("Özel fiyat bulunamadı");
    }
    await ctx.db.delete(args.id);
    return args.id;
  },
});
