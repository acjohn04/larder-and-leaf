'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { SchemaType } from '@google/generative-ai'
import { genAI } from '@/lib/gemini'
import { prisma } from '@/lib/prisma'
import { getDictionary } from '@/dictionaries'

// --- Validation Schemas ---
// All server action inputs pass through Zod before touching the database.
// This prevents malformed data from the client (or from Gemini-parsed results)
// from being persisted.

const AddItemSchema = z.object({
    name: z.string().min(1).max(200),
    category: z.string().min(1).max(100),
    quantity: z.number().positive().max(99999),
    unit: z.string().max(50).optional().default('units'),
    confidenceScore: z.number().min(0).max(1),
    expiresAt: z.coerce.date().optional(),
    minThreshold: z.number().min(0).max(99999).optional().default(0),
})

// Batch limit of 50 to prevent oversized inserts from a single scan.
const AddItemsSchema = z.array(AddItemSchema).min(1).max(50)

const DeleteItemSchema = z.object({
    id: z.string().min(1).max(100),
})

// --- Actions ---

export async function generateMealIdeas() {
    const inventory = await getInventory();
    const dict = await getDictionary();
    
    if (inventory.length === 0) {
        throw new Error(dict.errors.emptyPantry);
    }

    const inventoryList = inventory.map((item: { name: string; quantity: number; unit: string | null }) => `${item.name} (${item.quantity} ${item.unit})`).join(', ');

    // Use Gemini's typed responseSchema to guarantee the output
    // matches the MealIdea interface the client expects. This avoids
    // brittle prompt-based JSON extraction.
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        name: { type: SchemaType.STRING },
                        description: { type: SchemaType.STRING },
                        mainIngredients: { 
                            type: SchemaType.ARRAY,
                            items: { type: SchemaType.STRING }
                        }
                    },
                    required: ["name", "description", "mainIngredients"]
                }
            }
        }
    });

    const prompt = `Given the following grocery inventory: ${inventoryList}

Suggest 3 balanced meal combos. Each combo should be a realistic pairing of items from the inventory (you can assume basic staples like oil, salt, pepper, and water are available).
Keep the descriptions concise but appetizing. Focus on "meal combos" (e.g. Protein + Side + Vegetable) rather than complex recipes.`;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
}

export async function getInventory() {
    return prisma.inventoryItem.findMany({
        orderBy: { addedAt: 'desc' }
    });
}

export async function addInventoryItems(rawItems: {name: string, category: string, quantity: number, unit?: string, confidenceScore: number, expiresAt?: Date, minThreshold?: number}[]) {
    const items = AddItemsSchema.parse(rawItems);

    await prisma.inventoryItem.createMany({
        data: items.map(item => ({
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            confidenceScore: item.confidenceScore,
            expiresAt: item.expiresAt,
            minThreshold: item.minThreshold,
        }))
    });
    // Purge the dashboard's server-side cache so new items appear immediately.
    revalidatePath('/');
}

export async function deleteInventoryItem(rawId: string) {
    const { id } = DeleteItemSchema.parse({ id: rawId });

    await prisma.inventoryItem.delete({
        where: { id }
    });
    revalidatePath('/');
}

