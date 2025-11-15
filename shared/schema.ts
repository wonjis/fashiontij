import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const collections = pgTable("collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const designs = pgTable("designs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  collectionId: varchar("collection_id").references(() => collections.id),
  name: text("name").notNull(),
  description: text("description"),
  originalSketchUrl: text("original_sketch_url"),
  designImageUrl: text("design_image_url"),
  layers: jsonb("layers").default(sql`'[]'`),
  properties: jsonb("properties").default(sql`'{}'`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const resourceCategories = pgTable("resource_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const resourceItems = pgTable("resource_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => resourceCategories.id).notNull(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  designData: jsonb("design_data").default(sql`'{}'`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const techPacks = pgTable("tech_packs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  designId: varchar("design_id").references(() => designs.id).notNull(),
  designDescription: text("design_description"),
  specificationSheet: jsonb("specification_sheet").default(sql`'{}'`),
  billOfMaterials: jsonb("bill_of_materials").default(sql`'[]'`),
  constructionDetails: text("construction_details"),
  patternNotes: text("pattern_notes"),
  costSheet: jsonb("cost_sheet").default(sql`'{}'`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiRequests = pgTable("ai_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  designId: varchar("design_id").references(() => designs.id),
  prompt: text("prompt").notNull(),
  requestType: text("request_type").notNull(),
  result: jsonb("result"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDesignSchema = createInsertSchema(designs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertResourceCategorySchema = createInsertSchema(resourceCategories).omit({
  id: true,
  createdAt: true,
});

export const insertResourceItemSchema = createInsertSchema(resourceItems).omit({
  id: true,
  createdAt: true,
});

export const insertTechPackSchema = createInsertSchema(techPacks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiRequestSchema = createInsertSchema(aiRequests).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;

export type InsertDesign = z.infer<typeof insertDesignSchema>;
export type Design = typeof designs.$inferSelect;

export type InsertResourceCategory = z.infer<typeof insertResourceCategorySchema>;
export type ResourceCategory = typeof resourceCategories.$inferSelect;

export type InsertResourceItem = z.infer<typeof insertResourceItemSchema>;
export type ResourceItem = typeof resourceItems.$inferSelect;

export type InsertTechPack = z.infer<typeof insertTechPackSchema>;
export type TechPack = typeof techPacks.$inferSelect;

export type InsertAiRequest = z.infer<typeof insertAiRequestSchema>;
export type AiRequest = typeof aiRequests.$inferSelect;
