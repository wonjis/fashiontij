import { db } from "./db";
import { eq, and } from "drizzle-orm";
import {
  users, collections, designs, resourceCategories, resourceItems, techPacks, aiRequests,
  type User, type InsertUser,
  type Collection, type InsertCollection,
  type Design, type InsertDesign,
  type ResourceCategory, type InsertResourceCategory,
  type ResourceItem, type InsertResourceItem,
  type TechPack, type InsertTechPack,
  type AiRequest, type InsertAiRequest
} from "@shared/schema";
import type { IStorage } from "./storage";

export class DBStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getCollections(userId: string): Promise<Collection[]> {
    return db.select().from(collections).where(eq(collections.userId, userId));
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    const result = await db.select().from(collections).where(eq(collections.id, id)).limit(1);
    return result[0];
  }

  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const result = await db.insert(collections).values(insertCollection).returning();
    return result[0];
  }

  async updateCollection(id: string, updates: Partial<InsertCollection>): Promise<Collection | undefined> {
    const result = await db.update(collections)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(collections.id, id))
      .returning();
    return result[0];
  }

  async getDesigns(userId: string, collectionId?: string): Promise<Design[]> {
    if (collectionId) {
      return db.select().from(designs)
        .where(and(eq(designs.userId, userId), eq(designs.collectionId, collectionId)));
    }
    return db.select().from(designs).where(eq(designs.userId, userId));
  }

  async getDesign(id: string): Promise<Design | undefined> {
    const result = await db.select().from(designs).where(eq(designs.id, id)).limit(1);
    return result[0];
  }

  async createDesign(insertDesign: InsertDesign): Promise<Design> {
    const result = await db.insert(designs).values(insertDesign).returning();
    return result[0];
  }

  async updateDesign(id: string, updates: Partial<InsertDesign>): Promise<Design | undefined> {
    const result = await db.update(designs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(designs.id, id))
      .returning();
    return result[0];
  }

  async getResourceCategories(): Promise<ResourceCategory[]> {
    return db.select().from(resourceCategories);
  }

  async getResourceCategory(slug: string): Promise<ResourceCategory | undefined> {
    const result = await db.select().from(resourceCategories)
      .where(eq(resourceCategories.slug, slug)).limit(1);
    return result[0];
  }

  async getResourceItems(categoryId: string): Promise<ResourceItem[]> {
    return db.select().from(resourceItems).where(eq(resourceItems.categoryId, categoryId));
  }

  async getAllResourceItems(): Promise<ResourceItem[]> {
    return db.select().from(resourceItems);
  }

  async getResourceItem(id: string): Promise<ResourceItem | undefined> {
    const result = await db.select().from(resourceItems).where(eq(resourceItems.id, id)).limit(1);
    return result[0];
  }

  async createResourceItem(item: InsertResourceItem): Promise<ResourceItem> {
    const result = await db.insert(resourceItems).values(item).returning();
    return result[0];
  }

  async updateResourceItem(id: string, updates: Partial<InsertResourceItem>): Promise<ResourceItem | undefined> {
    const result = await db.update(resourceItems)
      .set(updates)
      .where(eq(resourceItems.id, id))
      .returning();
    return result[0];
  }

  async getAllTechPacks(): Promise<TechPack[]> {
    return db.select().from(techPacks);
  }

  async getTechPack(designId: string): Promise<TechPack | undefined> {
    const result = await db.select().from(techPacks)
      .where(eq(techPacks.designId, designId)).limit(1);
    return result[0];
  }

  async createTechPack(insertTechPack: InsertTechPack): Promise<TechPack> {
    const result = await db.insert(techPacks).values(insertTechPack).returning();
    return result[0];
  }

  async updateTechPack(id: string, updates: Partial<InsertTechPack>): Promise<TechPack | undefined> {
    const result = await db.update(techPacks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(techPacks.id, id))
      .returning();
    return result[0];
  }

  async createAiRequest(request: InsertAiRequest): Promise<AiRequest> {
    const result = await db.insert(aiRequests).values(request).returning();
    return result[0];
  }

  async getAiRequest(id: string): Promise<AiRequest | undefined> {
    const result = await db.select().from(aiRequests).where(eq(aiRequests.id, id)).limit(1);
    return result[0];
  }

  async updateAiRequest(id: string, updates: Partial<InsertAiRequest>): Promise<AiRequest | undefined> {
    const result = await db.update(aiRequests)
      .set(updates)
      .where(eq(aiRequests.id, id))
      .returning();
    return result[0];
  }
}
