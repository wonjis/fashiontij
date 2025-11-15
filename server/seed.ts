import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;

import { db } from "./db";
import { users, collections, designs, resourceCategories, resourceItems, techPacks } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Check if data already exists
  const existingCategories = await db.select().from(resourceCategories);
  if (existingCategories.length > 0) {
    console.log("Database already seeded");
    return;
  }

  const demoUserId = "demo-user";
  
  // Create demo user
  await db.insert(users).values({
    id: demoUserId,
    username: "demo",
    password: "demo123",
  }).onConflictDoNothing();

  // Create resource categories
  const categories = await db.insert(resourceCategories).values([
    { name: "Pants", slug: "pants", imageUrl: "/figmaAssets/jacket.png" },
    { name: "Blazers", slug: "blazers", imageUrl: "/figmaAssets/jacket.png" },
    { name: "Swimsuits", slug: "swimsuits", imageUrl: "/figmaAssets/jacket.png" },
    { name: "Jackets/Coats", slug: "jackets-coats", imageUrl: "/figmaAssets/jacket.png" }
  ]).returning();

  // Find pants category
  const pantsCategory = categories.find(c => c.slug === "pants");
  
  if (pantsCategory) {
    // Create resource items
    await db.insert(resourceItems).values([
      { categoryId: pantsCategory.id, name: "Drawstring pant", imageUrl: "/figmaAssets/jacket.png", designData: {} },
      { categoryId: pantsCategory.id, name: "Wide-leg trouser", imageUrl: "/figmaAssets/jacket.png", designData: {} },
      { categoryId: pantsCategory.id, name: "Baggy sweatpant", imageUrl: "/figmaAssets/jacket.png", designData: {} },
    ]);
  }

  // Create collection
  const [collection] = await db.insert(collections).values({
    userId: demoUserId,
    name: "SS26 collection",
    description: "Spring/Summer 2026 collection",
  }).returning();

  // Create designs
  const designsData = await db.insert(designs).values([
    {
      userId: demoUserId,
      collectionId: collection.id,
      name: "SS26 - Top #1",
      description: "Striped rugby pullover",
      originalSketchUrl: "/figmaAssets/jacket.png",
      designImageUrl: "/figmaAssets/jacket.png",
      layers: [],
      properties: {},
    },
    {
      userId: demoUserId,
      collectionId: collection.id,
      name: "SS26 - Top #2",
      description: "White pullover",
      originalSketchUrl: "/figmaAssets/jacket.png",
      designImageUrl: "/figmaAssets/jacket.png",
      layers: [],
      properties: {},
    },
    {
      userId: demoUserId,
      collectionId: collection.id,
      name: "SS26 - Outerwear #1",
      description: "Beige utility jacket",
      originalSketchUrl: "/figmaAssets/jacket.png",
      designImageUrl: "/figmaAssets/jacket.png",
      layers: [],
      properties: {},
    },
  ]).returning();

  // Create tech packs for each design
  for (const design of designsData) {
    await db.insert(techPacks).values({
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
    });
  }

  console.log("✅ Database seeded successfully!");
}

seed().catch(console.error);
