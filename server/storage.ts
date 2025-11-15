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
  getAllResourceItems(): Promise<ResourceItem[]>;
  getResourceItem(id: string): Promise<ResourceItem | undefined>;
  createResourceItem(item: InsertResourceItem): Promise<ResourceItem>;
  updateResourceItem(id: string, item: Partial<InsertResourceItem>): Promise<ResourceItem | undefined>;
  
  getAllTechPacks(): Promise<TechPack[]>;
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
    const demoUserId = "demo-user";
    const now = new Date();

    const categories = [
      { id: randomUUID(), name: "Pants", slug: "pants", imageUrl: "/figmaAssets/jacket.png", createdAt: now },
      { id: randomUUID(), name: "Blazers", slug: "blazers", imageUrl: "/figmaAssets/jacket.png", createdAt: now },
      { id: randomUUID(), name: "Swimsuits", slug: "swimsuits", imageUrl: "/figmaAssets/jacket.png", createdAt: now },
      { id: randomUUID(), name: "Jackets/Coats", slug: "jackets-coats", imageUrl: "/figmaAssets/jacket.png", createdAt: now }
    ];
    categories.forEach(cat => this.resourceCategories.set(cat.id, cat));

    const pantsCategory = Array.from(this.resourceCategories.values()).find(c => c.slug === "pants");
    const blazersCategory = Array.from(this.resourceCategories.values()).find(c => c.slug === "blazers");
    
    if (pantsCategory) {
      const resourceItems = [
        { id: randomUUID(), categoryId: pantsCategory.id, name: "Drawstring pant", imageUrl: "/figmaAssets/jacket.png", designData: {}, createdAt: now },
        { id: randomUUID(), categoryId: pantsCategory.id, name: "Wide-leg trouser", imageUrl: "/figmaAssets/jacket.png", designData: {}, createdAt: now },
        { id: randomUUID(), categoryId: pantsCategory.id, name: "Baggy sweatpant", imageUrl: "/figmaAssets/jacket.png", designData: {}, createdAt: now },
      ];
      resourceItems.forEach(item => this.resourceItems.set(item.id, item));
    }

    const collection = {
      id: randomUUID(),
      userId: demoUserId,
      name: "SS26 collection",
      description: "Spring/Summer 2026 collection",
      createdAt: now,
      updatedAt: now
    };
    this.collections.set(collection.id, collection);

    const designs = [
      {
        id: randomUUID(),
        userId: demoUserId,
        collectionId: collection.id,
        name: "SS26 - Top #1",
        description: "Striped rugby pullover",
        category: "Tops",
        season: "SS26",
        originalSketchUrl: "/figmaAssets/jacket.png",
        designImageUrl: "/figmaAssets/jacket.png",
        layers: [],
        properties: {},
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        userId: demoUserId,
        collectionId: collection.id,
        name: "SS26 - Top #2",
        description: "White pullover",
        category: "Tops",
        season: "SS26",
        originalSketchUrl: "/figmaAssets/jacket.png",
        designImageUrl: "/figmaAssets/jacket.png",
        layers: [],
        properties: {},
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: randomUUID(),
        userId: demoUserId,
        collectionId: collection.id,
        name: "SS26 - Outerwear #1",
        description: "Beige utility jacket",
        category: "Outerwear",
        season: "SS26",
        originalSketchUrl: "/figmaAssets/jacket.png",
        designImageUrl: "/figmaAssets/jacket.png",
        layers: [],
        properties: {},
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
    ];
    designs.forEach(design => this.designs.set(design.id, design));

    designs.forEach(design => {
      const techPack = {
        id: randomUUID(),
        designId: design.id,
        designDescription: "A relaxed-fit, long-sleeve pullover with a rugby-inspired silhouette and wide horizontal stripes alternating in powder blue and white.",
        specificationSheet: { chest: "44\"", length: "28\"", sleeve: "24\"" },
        billOfMaterials: [
          { item: "Main fabric", detail: "Cotton jersey" },
          { item: "Ribbed knit collar", detail: "Matching color" }
        ],
        constructionDetails: "Cut-and-sew construction with wide panel stripes; front and back panels aligned for stripe continuity.",
        patternNotes: "The hem sits slightly cropped for a balanced, modern proportion.",
        costSheet: { materials: 12.50, labor: 8.00, total: 20.50 },
        createdAt: design.createdAt,
        updatedAt: design.updatedAt,
      };
      this.techPacks.set(techPack.id, techPack);
    });
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
    const collection: Collection = { 
      ...insertCollection, 
      id, 
      description: insertCollection.description ?? null,
      createdAt: now, 
      updatedAt: now 
    };
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
      collectionId: insertDesign.collectionId ?? null,
      description: insertDesign.description ?? null,
      category: insertDesign.category ?? null,
      season: insertDesign.season ?? null,
      originalSketchUrl: insertDesign.originalSketchUrl ?? null,
      designImageUrl: insertDesign.designImageUrl ?? null,
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

  async getAllResourceItems(): Promise<ResourceItem[]> {
    return Array.from(this.resourceItems.values());
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

  async updateResourceItem(id: string, updates: Partial<InsertResourceItem>): Promise<ResourceItem | undefined> {
    const item = this.resourceItems.get(id);
    if (!item) return undefined;
    const updated = { ...item, ...updates };
    this.resourceItems.set(id, updated);
    return updated;
  }

  async getAllTechPacks(): Promise<TechPack[]> {
    return Array.from(this.techPacks.values());
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
      designDescription: insertTechPack.designDescription ?? null,
      constructionDetails: insertTechPack.constructionDetails ?? null,
      patternNotes: insertTechPack.patternNotes ?? null,
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
      designId: insertRequest.designId ?? null,
      result: insertRequest.result ?? null,
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

import { DBStorage } from "./dbStorage";

export const storage = new DBStorage();
