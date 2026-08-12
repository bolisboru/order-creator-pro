import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export type SettingsView = {
  companyName: string;
  companyAddress?: string;
  companyPhone?: string;
  logoStorageId?: string;
  logoUrl?: string | null;
  currency: string;
  vatRate: number;
};

/**
 * Current user's quote/company settings. Returns null until first saved.
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    if (!settings) return null;
    const logoUrl = settings.logoStorageId
      ? await ctx.storage.getUrl(settings.logoStorageId)
      : null;
    return {
      companyName: settings.companyName,
      companyAddress: settings.companyAddress,
      companyPhone: settings.companyPhone,
      logoStorageId: settings.logoStorageId,
      logoUrl,
      currency: settings.currency,
      vatRate: settings.vatRate,
    } satisfies SettingsView;
  },
});

/**
 * Create or update the user's settings.
 */
export const upsert = mutation({
  args: {
    companyName: v.string(),
    companyAddress: v.optional(v.string()),
    companyPhone: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    currency: v.string(),
    vatRate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    if (!args.companyName.trim()) {
      throw new Error("Firma adı zorunludur");
    }
    if (args.vatRate < 0 || args.vatRate > 100) {
      throw new Error("KDV oranı 0-100 arasında olmalıdır");
    }

    const existing = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const patch = {
      companyName: args.companyName.trim(),
      companyAddress: args.companyAddress?.trim() || undefined,
      companyPhone: args.companyPhone?.trim() || undefined,
      logoStorageId: args.logoStorageId,
      currency: args.currency,
      vatRate: args.vatRate,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }
    return await ctx.db.insert("settings", {
      userId: user._id,
      ...patch,
    });
  },
});

/**
 * Returns a URL the browser can POST the company logo file to.
 */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Remove the saved company logo.
 */
export const clearLogo = mutation({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    if (existing?.logoStorageId) {
      await ctx.storage.delete(existing.logoStorageId);
      await ctx.db.patch(existing._id, { logoStorageId: undefined });
    }
  },
});
