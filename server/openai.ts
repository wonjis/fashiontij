import OpenAI from "openai";
import { z } from "zod";

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
- constructionDetails and patternNotes: Write in Korean, use \\n for line breaks, 6-12 bullet points each
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
