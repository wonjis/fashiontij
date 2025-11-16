import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { generateTechSpec, generateTechnicalFlat } from "./openai";

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

  app.patch("/api/collections/:id", async (req, res) => {
    try {
      const collection = await storage.updateCollection(req.params.id, req.body);
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
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

  app.post("/api/designs/generate-flat", async (req, res) => {
    try {
      const { originalSketchUrl } = req.body;

      if (!originalSketchUrl) {
        return res.status(400).json({ 
          message: "Missing required field",
          details: "originalSketchUrl is required"
        });
      }

      console.log("Generating technical flat from sketch...");

      try {
        const generatedImageDataUrl = await generateTechnicalFlat(originalSketchUrl);
        
        const base64Data = generatedImageDataUrl.split(',')[1];
        if (!base64Data) {
          throw new Error("Failed to extract base64 data from generated image");
        }
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        const objectStorageService = new ObjectStorageService();
        const uploadUrl = await objectStorageService.getUploadUrl(
          `designs/${Date.now()}-technical-flat.png`,
          "image/png"
        );
        
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "image/png",
          },
          body: imageBuffer,
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload to object storage: ${uploadResponse.statusText}`);
        }
        
        const objectPath = uploadUrl.split('?')[0].split('/').slice(-2).join('/');
        const technicalFlatUrl = `/objects/${objectPath}`;
        
        await objectStorageService.setObjectAcl(objectPath, "public");
        
        console.log("Technical flat generated:", technicalFlatUrl);
        
        res.json({ technicalFlatUrl });
      } catch (error: any) {
        console.error("Failed to generate technical flat:", error);
        
        const isValidationError = error.message?.includes("Failed to analyze") || 
                                   error.message?.includes("Failed to generate");
        
        return res.status(isValidationError ? 422 : 500).json({ 
          message: isValidationError 
            ? "AI failed to generate technical flat from your sketch. Please try again with a clearer image."
            : "Failed to generate technical flat",
          details: error.message,
          retryable: true
        });
      }
    } catch (error: any) {
      console.error("Unexpected error in generate-flat:", error);
      res.status(500).json({ 
        message: "An unexpected error occurred",
        details: error.message
      });
    }
  });

  app.post("/api/designs/create", async (req, res) => {
    try {
      const userId = "demo-user";
      const { collectionId, name, category, season, originalSketchUrl, technicalFlatUrl } = req.body;

      if (!collectionId || !name || !category || !season || !originalSketchUrl || !technicalFlatUrl) {
        return res.status(400).json({ 
          message: "Missing required fields",
          details: "All fields (collectionId, name, category, season, originalSketchUrl, technicalFlatUrl) are required"
        });
      }

      console.log("Creating design:", { name, category, season });

      try {
        const design = await storage.createDesign({
          userId,
          collectionId,
          name,
          category,
          season,
          description: "Generating AI tech specs...",
          originalSketchUrl,
          designImageUrl: technicalFlatUrl,
          layers: [],
          properties: {},
        });
        console.log("Design created:", design.id);

        res.json({ design });
      } catch (error: any) {
        console.error("Failed to save to database:", error);
        return res.status(500).json({ 
          message: "Failed to save design to database",
          details: error.message,
        });
      }
    } catch (error: any) {
      console.error("Unexpected design creation error:", error);
      res.status(500).json({ 
        message: "An unexpected error occurred",
        details: error.message
      });
    }
  });

  app.post("/api/designs/:id/generate-techpack", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, category, season } = req.body;

      if (!name || !category || !season) {
        return res.status(400).json({ 
          message: "Missing required fields",
          details: "name, category, and season are required"
        });
      }

      console.log("Generating tech pack for design:", id);

      try {
        const techSpec = await generateTechSpec(name, category, season);
        
        if (!techSpec || !techSpec.designDescription) {
          throw new Error("Tech spec generation returned invalid data");
        }

        await storage.updateDesign(id, {
          description: techSpec.designDescription,
        });

        const techPack = await storage.createTechPack({
          designId: id,
          designDescription: techSpec.designDescription,
          specificationSheet: techSpec.specificationSheet,
          billOfMaterials: techSpec.billOfMaterials,
          constructionDetails: techSpec.constructionDetails,
          patternNotes: techSpec.patternNotes,
          costSheet: techSpec.costSheet,
        });

        console.log("Tech pack created:", techPack.id);
        res.json({ techPack });
      } catch (error: any) {
        console.error("Failed to generate tech pack:", error);
        
        const isValidationError = error.message?.includes("validation failed") || 
                                   error.message?.includes("parsing failed") ||
                                   error.message?.includes("Invalid") ||
                                   error.message?.includes("Missing");
        
        return res.status(isValidationError ? 422 : 500).json({ 
          message: isValidationError 
            ? "AI failed to generate tech specs. Please try again."
            : "Failed to generate tech specs",
          details: error.message,
          retryable: true
        });
      }
    } catch (error: any) {
      console.error("Unexpected error generating tech pack:", error);
      res.status(500).json({ 
        message: "An unexpected error occurred",
        details: error.message
      });
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
      const items = await storage.getAllResourceItems();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/resource-categories", async (req, res) => {
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

  app.post("/api/resource-items", async (req, res) => {
    try {
      const item = await storage.createResourceItem(req.body);
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/resource-items/:id", async (req, res) => {
    try {
      const item = await storage.updateResourceItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ message: "Resource item not found" });
      }
      res.json(item);
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

  app.get("/api/techpacks", async (req, res) => {
    try {
      const techPacks = await storage.getAllTechPacks();
      res.json(techPacks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/techpacks", async (req, res) => {
    try {
      const techPack = await storage.createTechPack(req.body);
      res.json(techPack);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/techpacks/:id", async (req, res) => {
    try {
      const techPack = await storage.updateTechPack(req.params.id, req.body);
      res.json(techPack);
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
