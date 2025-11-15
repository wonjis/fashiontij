import { 
  type User, type InsertUser,
  type Collection, type InsertCollection,
  type Design, type InsertDesign,
  type ResourceCategory, type InsertResourceCategory,
  type ResourceItem, type InsertResourceItem,
  type TechPack, type InsertTechPack,
  type AiRequest, type InsertAiRequest
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCollections(userId: string): Promise<Collection[]>;
  getCollection(id: string): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  updateCollection(id: string, collection: Partial<InsertCollection>): Promise<Collection | undefined>;
  
  getDesigns(userId: string, collectionId?: string): Promise<Design[]>;
  getDesign(id: string): Promise<Design | undefined>;
  createDesign(design: InsertDesign): Promise<Design>;
  updateDesign(id: string, design: Partial<InsertDesign>): Promise<Design | undefined>;
  
  getResourceCategories(): Promise<ResourceCategory[]>;
  getResourceCategory(slug: string): Promise<ResourceCategory | undefined>;
  getResourceItems(categoryId: string): Promise<ResourceItem[]>;
  getResourceItem(id: string): Promise<ResourceItem | undefined>;
  createResourceItem(item: InsertResourceItem): Promise<ResourceItem>;
  
  getTechPack(designId: string): Promise<TechPack | undefined>;
  createTechPack(techPack: InsertTechPack): Promise<TechPack>;
  updateTechPack(id: string, techPack: Partial<InsertTechPack>): Promise<TechPack | undefined>;
  
  createAiRequest(request: InsertAiRequest): Promise<AiRequest>;
  getAiRequest(id: string): Promise<AiRequest | undefined>;
  updateAiRequest(id: string, request: Partial<InsertAiRequest>): Promise<AiRequest | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private collections: Map<string, Collection>;
  private designs: Map<string, Design>;
  private resourceCategories: Map<string, ResourceCategory>;
  private resourceItems: Map<string, ResourceItem>;
  private techPacks: Map<string, TechPack>;
  private aiRequests: Map<string, AiRequest>;

  constructor() {
    this.users = new Map();
    this.collections = new Map();
    this.designs = new Map();
    this.resourceCategories = new Map();
    this.resourceItems = new Map();
    this.techPacks = new Map();
    this.aiRequests = new Map();
    
    this.seedData();
  }

  private seedData() {
    const categories = [
      { id: randomUUID(), name: "Pants", slug: "pants", imageUrl: "/figmaAssets/jacket.png", createdAt: new Date() },
      { id: randomUUID(), name: "Blazers", slug: "blazers", imageUrl: "/figmaAssets/jacket.png", createdAt: new Date() },
      { id: randomUUID(), name: "Swimsuits", slug: "swimsuits", imageUrl: "/figmaAssets/jacket.png", createdAt: new Date() },
      { id: randomUUID(), name: "Jackets/Coats", slug: "jackets-coats", imageUrl: "/figmaAssets/jacket.png", createdAt: new Date() }
    ];
    categories.forEach(cat => this.resourceCategories.set(cat.id, cat));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getCollections(userId: string): Promise<Collection[]> {
    return Array.from(this.collections.values()).filter(c => c.userId === userId);
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    return this.collections.get(id);
  }

  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const id = randomUUID();
    const now = new Date();
    const collection: Collection = { ...insertCollection, id, createdAt: now, updatedAt: now };
    this.collections.set(id, collection);
    return collection;
  }

  async updateCollection(id: string, updates: Partial<InsertCollection>): Promise<Collection | undefined> {
    const collection = this.collections.get(id);
    if (!collection) return undefined;
    const updated = { ...collection, ...updates, updatedAt: new Date() };
    this.collections.set(id, updated);
    return updated;
  }

  async getDesigns(userId: string, collectionId?: string): Promise<Design[]> {
    return Array.from(this.designs.values()).filter(d => 
      d.userId === userId && (!collectionId || d.collectionId === collectionId)
    );
  }

  async getDesign(id: string): Promise<Design | undefined> {
    return this.designs.get(id);
  }

  async createDesign(insertDesign: InsertDesign): Promise<Design> {
    const id = randomUUID();
    const now = new Date();
    const design: Design = { 
      ...insertDesign, 
      id, 
      createdAt: now, 
      updatedAt: now,
      layers: insertDesign.layers || [],
      properties: insertDesign.properties || {}
    };
    this.designs.set(id, design);
    return design;
  }

  async updateDesign(id: string, updates: Partial<InsertDesign>): Promise<Design | undefined> {
    const design = this.designs.get(id);
    if (!design) return undefined;
    const updated = { ...design, ...updates, updatedAt: new Date() };
    this.designs.set(id, updated);
    return updated;
  }

  async getResourceCategories(): Promise<ResourceCategory[]> {
    return Array.from(this.resourceCategories.values());
  }

  async getResourceCategory(slug: string): Promise<ResourceCategory | undefined> {
    return Array.from(this.resourceCategories.values()).find(c => c.slug === slug);
  }

  async getResourceItems(categoryId: string): Promise<ResourceItem[]> {
    return Array.from(this.resourceItems.values()).filter(i => i.categoryId === categoryId);
  }

  async getResourceItem(id: string): Promise<ResourceItem | undefined> {
    return this.resourceItems.get(id);
  }

  async createResourceItem(insertItem: InsertResourceItem): Promise<ResourceItem> {
    const id = randomUUID();
    const item: ResourceItem = { 
      ...insertItem, 
      id, 
      createdAt: new Date(),
      designData: insertItem.designData || {}
    };
    this.resourceItems.set(id, item);
    return item;
  }

  async getTechPack(designId: string): Promise<TechPack | undefined> {
    return Array.from(this.techPacks.values()).find(tp => tp.designId === designId);
  }

  async createTechPack(insertTechPack: InsertTechPack): Promise<TechPack> {
    const id = randomUUID();
    const now = new Date();
    const techPack: TechPack = { 
      ...insertTechPack, 
      id, 
      createdAt: now, 
      updatedAt: now,
      specificationSheet: insertTechPack.specificationSheet || {},
      billOfMaterials: insertTechPack.billOfMaterials || [],
      costSheet: insertTechPack.costSheet || {}
    };
    this.techPacks.set(id, techPack);
    return techPack;
  }

  async updateTechPack(id: string, updates: Partial<InsertTechPack>): Promise<TechPack | undefined> {
    const techPack = this.techPacks.get(id);
    if (!techPack) return undefined;
    const updated = { ...techPack, ...updates, updatedAt: new Date() };
    this.techPacks.set(id, updated);
    return updated;
  }

  async createAiRequest(insertRequest: InsertAiRequest): Promise<AiRequest> {
    const id = randomUUID();
    const request: AiRequest = { 
      ...insertRequest, 
      id, 
      createdAt: new Date(),
      status: insertRequest.status || "pending"
    };
    this.aiRequests.set(id, request);
    return request;
  }

  async getAiRequest(id: string): Promise<AiRequest | undefined> {
    return this.aiRequests.get(id);
  }

  async updateAiRequest(id: string, updates: Partial<InsertAiRequest>): Promise<AiRequest | undefined> {
    const request = this.aiRequests.get(id);
    if (!request) return undefined;
    const updated = { ...request, ...updates };
    this.aiRequests.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
