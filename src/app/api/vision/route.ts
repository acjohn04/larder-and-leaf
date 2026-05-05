import { NextResponse } from "next/server";
import { genAI } from "@/lib/gemini";

// --- Upload constraints ---
// These guard against oversized payloads and non-image file types
// before any Gemini API call is made.
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Validate file size
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10 MB." },
        { status: 413 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Accepted formats: JPEG, PNG, WebP, HEIC." },
        { status: 415 }
      );
    }

    if (process.env.USE_MOCK_GEMINI === 'true') {
      console.log("Using MOCK Gemini response for vision API.");
      return NextResponse.json({
        items: [
          {
            uid: "mock-1",
            name: "Fresh Spinach",
            category: "produce",
            quantity: { current: 1, unit: "bag" },
            expires_in_days: 7,
            metadata: {
              is_barcode: false,
              confidence: 0.95,
              added_at: new Date().toISOString(),
              freshness_rating: 4,
              status: "use_immediately"
            }
          },
          {
            uid: "mock-2",
            name: "Organic Eggs",
            category: "dairy_eggs",
            quantity: { current: 12, unit: "pieces" },
            expires_in_days: 21,
            metadata: {
              is_barcode: false,
              confidence: 0.99,
              added_at: new Date().toISOString(),
              freshness_rating: 5,
              status: "pantry"
            }
          },
          {
            uid: "mock-3",
            name: "Whole Wheat Bread",
            category: "bakery",
            quantity: { current: 1, unit: "loaf" },
            expires_in_days: 5,
            metadata: {
              is_barcode: false,
              confidence: 0.90,
              added_at: new Date().toISOString(),
              freshness_rating: 3,
              status: "pantry"
            }
          }
        ]
      });
    }

    // Configure Gemini to return structured JSON directly,
    // avoiding the need for manual text extraction from the response.
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // Convert File to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `Analyze the provided image. Identify all food items.
IMPORTANT: Do NOT include any drinks or beverages (e.g., soda, juice, water, alcohol, coffee, tea). Focus exclusively on solid food items and cooking ingredients.

For each item, provide a JSON object with:
- uid: a generated string uuid
- name: common name of the item
- category: MUST be one of ["produce", "pantry", "dairy_eggs", "meat_seafood", "bakery", "frozen"]
- quantity: an object with "current" (number) and "unit" (string, e.g., "pieces", "oz", "lbs")
- expires_in_days: an estimated number of days until the item expires based on its type and visual freshness (number)
- metadata: an object with:
  - is_barcode: false
  - confidence: number between 0.0 and 1.0
  - added_at: current ISO date string
  - freshness_rating: number from 1-5
  - status: MUST be one of ["use_immediately", "pantry", "refrigerated", "frozen"]. 
    * Rule: If category is "frozen", status MUST be "frozen". 
    * Rule: If category is "pantry", status MUST be "pantry".

Only return items you are >80% sure about. 
Return an array of these JSON objects.`;

    // Retry loop with linear backoff (1s, 2s, 3s) to handle transient
    // Gemini API failures (rate limits, network blips). On the final
    // attempt the error is re-thrown to the outer catch block.
    const maxRetries = 3;
    let result;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Processing image upload. Name: ${imageFile.name}, Type: ${imageFile.type}, Size: ${imageFile.size}`);
        
        result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Image,
              mimeType: imageFile.type,
            },
          },
        ]);
        break;
      } catch (err: unknown) {
        if (attempt === maxRetries) {
          throw err;
        }
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`Gemini API error (attempt ${attempt}): ${message}. Retrying...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }

    if (!result) {
        return NextResponse.json({ error: "Failed to process image. Please try again." }, { status: 500 });
    }

    // Even with responseMimeType set to JSON, Gemini can occasionally
    // return malformed output — parse defensively.
    const text = result.response.text();
    let parsedItems = [];
    try {
      parsedItems = JSON.parse(text);
    } catch (_e) {
      console.error("Failed to parse JSON from Gemini", text);
      return NextResponse.json({ error: "Failed to process image. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ items: parsedItems });
  } catch (error: unknown) {
    console.error("Vision API Error:", error);
    return NextResponse.json(
      { error: "Failed to process image. Please try again." },
      { status: 500 }
    );
  }
}
