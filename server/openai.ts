import OpenAI from "openai";
import { z } from "zod";
import sharp from "sharp";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const BillOfMaterialsItemSchema = z.object({
  item: z.string().min(1, "Item name is required"),
  detail: z.string().min(1, "Item detail is required"),
});

const parseNumericValue = (val: unknown): number => {
  if (typeof val === "number") {
    if (isNaN(val)) {
      throw new Error("Cost value is NaN");
    }
    return val;
  }
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.-]/g, "");
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed) || cleaned === "") {
      throw new Error(`Invalid numeric value: "${val}"`);
    }
    return parsed;
  }
  if (val === null || val === undefined) {
    throw new Error("Cost value is missing");
  }
  throw new Error(`Unexpected cost value type: ${typeof val}`);
};

const CostSheetSchema = z.object({
  materials: z.unknown().transform(parseNumericValue),
  labor: z.unknown().transform(parseNumericValue),
  trims: z.unknown().transform(parseNumericValue),
  overhead: z.unknown().transform(parseNumericValue),
  total: z.unknown().transform(parseNumericValue),
});

const TechSpecSchema = z.object({
  designDescription: z.string().min(10, "Design description must be at least 10 characters"),
  specificationSheet: z.record(z.string(), z.string()),
  billOfMaterials: z.array(BillOfMaterialsItemSchema).min(1, "At least one material is required"),
  constructionDetails: z.string().min(10, "Construction details must be at least 10 characters"),
  patternNotes: z.string().min(10, "Pattern notes must be at least 10 characters"),
  costSheet: CostSheetSchema,
});

interface TechSpecResult {
  designDescription: string;
  specificationSheet: Record<string, string>;
  billOfMaterials: Array<{ item: string; detail: string }>;
  constructionDetails: string;
  patternNotes: string;
  costSheet: { materials: number; labor: number; trims: number; overhead: number; total: number };
}

export async function generateTechSpec(
  designName: string,
  category: string,
  season: string
): Promise<TechSpecResult> {
  const prompt = `You are a senior fashion technical designer creating production-ready tech pack text for an apparel design.

Input:
- Design Name: ${designName}
- Category: ${category}
- Season: ${season}

Generate complete technical specifications in JSON format. Respond ONLY with a valid JSON object, no other text.

The JSON must have this exact structure:
{
  "designDescription": "2-4 sentences about the garment. Include silhouette, key features, closures, pockets, hem/length, and overall vibe.",
  "specificationSheet": {
    "chest": "44in",
    "back_length": "28in",
    "sleeve_length": "24in"
  },
  "billOfMaterials": [
    {"item": "Main fabric", "detail": "Cotton jersey"},
    {"item": "Ribbed collar", "detail": "Matching color"}
  ],
  "constructionDetails": "- 록스티치로 어깨 솔기 봉제\n- 오버록 처리로 마감\n- 포켓은 이중 바느질로 보강\n- 밑단은 커버스티치 마감\n- 칼라는 별도 재단 후 부착",
  "patternNotes": "- 릴렉스 핏으로 여유 있는 실루엣\n- 드롭 숄더로 편안한 착용감\n- 밑단은 약간 크롭 길이\n- 스트라이프 패널 정렬 필수",
  "costSheet": {
    "materials": 12.50,
    "labor": 8.00,
    "trims": 2.50,
    "overhead": 3.00,
    "total": 26.00
  }
}

Rules:
- specificationSheet: Include 8-14 measurements based on garment type (tops: chest, shoulder_width, back_length, sleeve_length, etc. / pants: waist, hip, rise, inseam, etc.)
- billOfMaterials: Include main fabric, lining (if needed), trims, closures, thread, interfacing, labels
- constructionDetails and patternNotes: Write in English, use \\n for line breaks, 6-12 bullet points each
- costSheet: total must equal sum of materials + labor + trims + overhead
- All JSON must be valid (no trailing commas)`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Failed to generate tech spec");
  }

  return parseTechSpec(content);
}

async function makeWhiteTransparent(imageBuffer: Buffer): Promise<Buffer> {
  try {
    const image = sharp(imageBuffer);
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixelCount = info.width * info.height;
    const channels = info.channels;

    for (let i = 0; i < pixelCount; i++) {
      const offset = i * channels;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];

      if (r > 240 && g > 240 && b > 240) {
        data[offset + 3] = 0;
      }
    }

    return await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: channels,
      },
    })
      .png()
      .toBuffer();
  } catch (error) {
    console.error("Failed to make white transparent:", error);
    return imageBuffer;
  }
}

export async function generateTechnicalFlat(sketchImageUrl: string): Promise<string> {
  let imageDataUrl: string;
  
  if (sketchImageUrl.startsWith('/objects/')) {
    const fullUrl = `http://localhost:5000${sketchImageUrl}`;
    const imageResponse = await fetch(fullUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch sketch image: ${imageResponse.statusText}`);
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString('base64');
    const contentType = imageResponse.headers.get('content-type') || 'image/png';
    imageDataUrl = `data:${contentType};base64,${base64}`;
  } else if (sketchImageUrl.startsWith('http://') || sketchImageUrl.startsWith('https://')) {
    imageDataUrl = sketchImageUrl;
  } else {
    throw new Error('Invalid sketch image URL format');
  }

  const imageToTextPrompt = `You are a professional fashion designer and technical designer.
Analyze the garment in the input image and describe all key traits required to create a production-ready technical flat. Extract and explain:

Silhouette & overall proportions

Key garment pieces & paneling (front, back, sleeves, hood, collar, yokes, gussets, etc.)

Construction details (seam placements, stitch types, topstitch locations)

Collar/neckline construction (shape, stand, edge stitch, height, placket style)

Pocket construction (type, placement, stitch details)

Cuffs, hems, and finishings (rib, elastic, fold-back hem, binding, facing)

Closures & hardware (zippers, pullers, buttons, snaps, cords, toggles)

Fabric panel breaks & style lines

Pleats, gathers, darts, tucks

Technical details for production (bar tacks, reinforcement points, stitch lines)

Any unique design elements

Output a clean, structured technical description that DALL·E can use to draw an accurate hi-fidelity technical flat.
Do NOT generate the image; ONLY output the technical description text.`;

  const analysisResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: imageToTextPrompt },
          { type: "image_url", image_url: { url: imageDataUrl } }
        ]
      }
    ],
    max_tokens: 1000,
  });

  const technicalDescription = analysisResponse.choices[0]?.message?.content;
  if (!technicalDescription) {
    throw new Error("Failed to analyze sketch image");
  }

  const textToImagePrompt = `You are creating a professional fashion technical flat (tech pack illustration).

CRITICAL REQUIREMENTS:
1. TRANSPARENT BACKGROUND - Only the area OUTSIDE the garment should be transparent. The background around the garment must be 100% transparent (alpha = 0).
2. WHITE FILL INSIDE GARMENT - The garment interior must be filled with pure white color.
3. BLACK LINES - Draw all garment outlines, seams, details with clean black lines.
4. FRONT VIEW ONLY - Draw ONLY the front panel/view of the garment. Do NOT draw the back view.
5. OUTPUT: PNG format with transparent background.

GARMENT TO DRAW:
${technicalDescription}

DRAWING SPECIFICATIONS:
- Style: Professional fashion technical flat (tech pack illustration style)
- Background: Transparent (only outside the garment)
- Garment fill: Solid white color inside the garment shape
- Lines: Clean black linework for all edges, seams, stitching, topstitching, panels, pockets, closures, hardware
- Line weight: Consistent thickness throughout
- View: FRONT VIEW ONLY (앞판만)
- NO gradients, NO shading, NO textures
- NO model, NO human figure, NO scenery
- NO back view, NO side view

Example structure:
- Transparent pixels = area outside garment outline
- White pixels = filled area inside garment
- Black pixels = garment outline, seams, details

The final image must be a PNG showing a front-view technical flat with transparent background, white-filled garment, and black linework.`;

  const imageResponse = await openai.images.generate({
    model: "gpt-image-1",
    prompt: textToImagePrompt,
    n: 1,
    size: "1024x1024",
  });

  const b64Json = imageResponse.data?.[0]?.b64_json;
  if (!b64Json) {
    console.error("Image response data:", imageResponse.data);
    throw new Error("Failed to generate technical flat image - no image data in response");
  }

  const imageBuffer = Buffer.from(b64Json, 'base64');
  const dataUrl = `data:image/png;base64,${b64Json}`;
  
  return dataUrl;
}

function parseTechSpec(content: string): TechSpecResult {
  let cleanedContent = content.trim();
  
  if (cleanedContent.startsWith("```json")) {
    cleanedContent = cleanedContent.slice(7);
  }
  if (cleanedContent.startsWith("```")) {
    cleanedContent = cleanedContent.slice(3);
  }
  if (cleanedContent.endsWith("```")) {
    cleanedContent = cleanedContent.slice(0, -3);
  }
  cleanedContent = cleanedContent.trim();
  
  try {
    const parsed = JSON.parse(cleanedContent);
    
    const validated = TechSpecSchema.parse(parsed);
    
    const expectedTotal = validated.costSheet.materials + validated.costSheet.labor + 
                         validated.costSheet.trims + validated.costSheet.overhead;
    const totalDiff = Math.abs(validated.costSheet.total - expectedTotal);
    if (totalDiff > 0.01) {
      throw new Error(
        `Cost sheet validation failed: total (${validated.costSheet.total}) does not match sum of components (${expectedTotal})`
      );
    }
    
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
      console.error("Tech spec validation failed:", issues);
      console.error("Raw content:", content);
      throw new Error(`Tech spec validation failed: ${issues}`);
    }
    console.error("Failed to parse tech spec JSON:", error);
    console.error("Raw content:", content);
    throw new Error(`Tech spec parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
