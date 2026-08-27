import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  json,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  price: integer("price").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  ingredients: json("ingredients").$type<string[]>().default([]),
  duploPrice: integer("duplo_price"),
  isSandwich: boolean("is_sandwich").notNull().default(false),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerNumber: varchar("customer_number", { length: 50 }).notNull(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pendente"),
  total: integer("total").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  removedIngredients: json("removed_ingredients").$type<string[]>().default([]),
  notes: text("notes"),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
