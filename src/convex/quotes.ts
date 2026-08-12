import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { quoteItemValidator } from "./schema";

/**
 * All quotes for the signed-in user, newest first.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const quotes = await ctx.db
      .query("quotes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    return quotes.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const get = query({
  args: { id: v.id("quotes") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const quote = await ctx.db.get(args.id);
    if (!quote || quote.userId !== user._id) return null;
    return quote;
  },
});

export const create = mutation({
  args: {
    customerName: v.string(),
    deliveryAddress: v.string(),
    contactNumber: v.string(),
    orderDate: v.string(),
    items: v.array(quoteItemValidator),
    hasDiscount: v.boolean(),
    hasSystem: v.boolean(),
    hasBarcode: v.boolean(),
    currency: v.string(),
    vatRate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    if (!args.customerName.trim()) {
      throw new Error("Firma adı zorunludur");
    }
    if (args.items.length === 0) {
      throw new Error("Teklife en az bir ürün ekleyin");
    }
    if (args.items.some((i) => !i.name.trim() || i.quantity <= 0)) {
      throw new Error("Ürün adı ve miktarı geçerli olmalıdır");
    }
    if (args.vatRate < 0 || args.vatRate > 100) {
      throw new Error("KDV oranı 0-100 arasında olmalıdır");
    }

    // Sequential quote number per user (single-user app, safe enough)
    const existing = await ctx.db
      .query("quotes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const quoteNo =
      existing.reduce((max, q) => Math.max(max, q.quoteNo), 0) + 1;

    const id = await ctx.db.insert("quotes", {
      userId: user._id,
      quoteNo,
      customerName: args.customerName.trim(),
      deliveryAddress: args.deliveryAddress.trim(),
      contactNumber: args.contactNumber.trim(),
      orderDate: args.orderDate,
      items: args.items.map((i) => ({
        name: i.name.trim(),
        price: i.price,
        quantity: i.quantity,
        description: i.description?.trim() || undefined,
      })),
      hasDiscount: args.hasDiscount,
      hasSystem: args.hasSystem,
      hasBarcode: args.hasBarcode,
      currency: args.currency,
      vatRate: args.vatRate,
      createdAt: Date.now(),
    });

    return { id, quoteNo };
  },
});

export const remove = mutation({
  args: { id: v.id("quotes") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const quote = await ctx.db.get(args.id);
    if (!quote || quote.userId !== user._id) {
      throw new Error("Teklif bulunamadı");
    }
    await ctx.db.delete(args.id);
    return args.id;
  },
});
