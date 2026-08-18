import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

/** A single line item inside an order quote. */
export const quoteItemValidator = v.object({
  name: v.string(),
  price: v.number(),
  quantity: v.number(),
  unit: v.optional(v.string()), // adet, top, mt, m2, kg, …
  description: v.optional(v.string()),
});
export type QuoteItem = Infer<typeof quoteItemValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Factory product catalog: what the factory can produce / sell
    products: defineTable({
      userId: v.id("users"),
      name: v.string(),
      price: v.number(),
      unit: v.optional(v.string()),
      description: v.optional(v.string()),
      isActive: v.boolean(),
    }).index("by_user", ["userId"]),

    // Records: "teklif" = quote sent to the customer (full detail),
    // "siparis" = internal production order (products + prices, no calc)
    quotes: defineTable({
      userId: v.id("users"),
      kind: v.optional(v.union(v.literal("teklif"), v.literal("siparis"))),
      quoteNo: v.number(),
      customerName: v.string(),
      deliveryAddress: v.string(),
      contactNumber: v.string(),
      orderDate: v.string(), // ISO yyyy-mm-dd
      items: v.array(quoteItemValidator),
      // optional extras marked on the quote: discount / system / barcode label
      hasDiscount: v.boolean(),
      hasSystem: v.boolean(),
      hasBarcode: v.boolean(),
      currency: v.string(),
      vatRate: v.number(), // KDV percent
      createdAt: v.number(),
    }).index("by_user", ["userId"]),

    // Customers (müşteri kartı): firm name, delivery address, contact
    customers: defineTable({
      userId: v.id("users"),
      name: v.string(),
      deliveryAddress: v.optional(v.string()),
      contactNumber: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    // Customer-specific product prices (müşteriye özel fiyat)
    customerPrices: defineTable({
      userId: v.id("users"),
      customerId: v.id("customers"),
      productId: v.id("products"),
      price: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_customer", ["customerId"])
      .index("by_product", ["productId"]),

    // Per-user company/quote preferences: logo, currency, VAT
    settings: defineTable({
      userId: v.id("users"),
      companyName: v.string(),
      companyAddress: v.optional(v.string()),
      companyPhone: v.optional(v.string()),
      logoStorageId: v.optional(v.id("_storage")),
      currency: v.string(),
      vatRate: v.number(),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
