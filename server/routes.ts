import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/collections", async (req, res) => {
    try {
      const userId = "demo-user";
      const collections = await storage.getCollections(userId);
      res.json(collections);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/collections", async (req, res) => {
    try {
      const userId = "demo-user";
      const collection = await storage.createCollection({
        ...req.body,
        userId,
      });
      res.json(collection);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/designs", async (req, res) => {
    try {
      const userId = "demo-user";
      const collectionId = req.query.collectionId as string | undefined;
      const designs = await storage.getDesigns(userId, collectionId);
      res.json(designs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/designs/:id", async (req, res) => {
    try {
      const design = await storage.getDesign(req.params.id);
      if (!design) {
        return res.status(404).json({ message: "Design not found" });
      }
      res.json(design);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/designs", async (req, res) => {
    try {
      const userId = "demo-user";
      const design = await storage.createDesign({
        ...req.body,
        userId,
      });
      res.json(design);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/designs/:id", async (req, res) => {
    try {
      const design = await storage.updateDesign(req.params.id, req.body);
      if (!design) {
        return res.status(404).json({ message: "Design not found" });
      }
      res.json(design);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/resources", async (req, res) => {
    try {
      const categories = await storage.getResourceCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/resources/:categorySlug", async (req, res) => {
    try {
      const category = await storage.getResourceCategory(req.params.categorySlug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      const items = await storage.getResourceItems(category.id);
      res.json({ category, items });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/resources/:categorySlug/copy", async (req, res) => {
    try {
      const userId = "demo-user";
      const { itemId } = req.body;
      const item = await storage.getResourceItem(itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      const design = await storage.createDesign({
        userId,
        name: `${item.name} - Copy`,
        description: `Copied from resources`,
        designImageUrl: item.imageUrl,
        collectionId: null,
        originalSketchUrl: null,
        layers: item.designData as any,
        properties: {},
      });

      res.json(design);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error: any) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/design-images", async (req, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    const userId = "demo-user";

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: userId,
          visibility: "public",
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error: any) {
      console.error("Error setting design image:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/designs/:id/techpack", async (req, res) => {
    try {
      const techPack = await storage.getTechPack(req.params.id);
      res.json(techPack || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/designs/:id/techpack", async (req, res) => {
    try {
      const techPack = await storage.createTechPack({
        ...req.body,
        designId: req.params.id,
      });
      res.json(techPack);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ai/generate", async (req, res) => {
    try {
      const userId = "demo-user";
      const aiRequest = await storage.createAiRequest({
        userId,
        prompt: req.body.prompt,
        requestType: req.body.requestType,
        designId: req.body.designId || null,
        result: null,
        status: "completed"
      });
      
      res.json({
        id: aiRequest.id,
        result: "AI generation would happen here with actual AI integration",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
