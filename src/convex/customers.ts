import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

const customerInputValidator = v.object({
  name: v.string(),
  deliveryAddress: v.optional(v.string()),
  contactNumber: v.optional(v.string()),
});

/**
 * The user's customers (müşteri kartları), sorted by name.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    return customers.sort((a, b) => a.name.localeCompare(b.name, "tr"));
  },
});

export const create = mutation({
  args: customerInputValidator,
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const name = args.name.trim();
    if (!name) throw new Error("Firma adı boş olamaz");
    return await ctx.db.insert("customers", {
      userId: user._id,
      name,
      deliveryAddress: args.deliveryAddress?.trim() || undefined,
      contactNumber: args.contactNumber?.trim() || undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("customers"),
    name: v.string(),
    deliveryAddress: v.optional(v.string()),
    contactNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== user._id) {
      throw new Error("Müşteri bulunamadı");
    }
    const name = args.name.trim();
    if (!name) throw new Error("Firma adı boş olamaz");
    await ctx.db.patch(args.id, {
      name,
      deliveryAddress: args.deliveryAddress?.trim() || undefined,
      contactNumber: args.contactNumber?.trim() || undefined,
    });
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== user._id) {
      throw new Error("Müşteri bulunamadı");
    }
    // Remove this customer's special prices too
    const prices = await ctx.db
      .query("customerPrices")
      .withIndex("by_customer", (q) => q.eq("customerId", args.id))
      .collect();
    for (const p of prices) await ctx.db.delete(p._id);
    await ctx.db.delete(args.id);
    return args.id;
  },
});

/**
 * Bulk import pasted customer rows (name / address / phone). Skips empties.
 */
export const bulkCreate = mutation({
  args: { customers: v.array(customerInputValidator) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    let count = 0;
    for (const c of args.customers) {
      const name = c.name.trim();
      if (!name) continue;
      await ctx.db.insert("customers", {
        userId: user._id,
        name,
        deliveryAddress: c.deliveryAddress?.trim() || undefined,
        contactNumber: c.contactNumber?.trim() || undefined,
      });
      count += 1;
    }
    return count;
  },
});
