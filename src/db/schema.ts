import {
    pgTable, uuid, text, timestamp, pgEnum, integer,
  } from "drizzle-orm/pg-core";
  
  // Roller (ileride Auth ile kullanacağız)
  export const userRole = pgEnum("user_role", ["OWNER","MANAGER","TRAINER","STAFF","MEMBER"]);
  
  // Tenants
  export const tenants = pgTable("tenants", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  });
  
  // Members
  export const members = pgTable("members", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    status: text("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  });
  
  // Rezervasyon için temel slot (ileride geliştireceğiz)
  export const slotType = pgEnum("slot_type", ["CLASS","PT"]);
  
  export const timeSlots = pgTable("time_slots", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    type: text("type").$type<"CLASS" | "PT">().notNull().default("CLASS"),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    capacity: integer("capacity").notNull().default(10),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  });
  