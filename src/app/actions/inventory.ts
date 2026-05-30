'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { SchemaType } from '@google/generative-ai'
import { genAI } from '@/lib/gemini'
import { prisma } from '@/lib/prisma'
import { getDictionary } from '@/dictionaries'
import { InventoryItem } from '@prisma/client'
import { auth, requireAuth } from '@/lib/auth'

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

const UpdateItemSchema = z.object({
    id: z.string().min(1).max(100),
    name: z.string().min(1).max(200),
    category: z.string().min(1).max(100),
    quantity: z.number().positive().max(99999),
    unit: z.string().max(50).optional().default('units'),
    minThreshold: z.number().min(0).max(99999).optional().default(0),
    expiresAt: z.coerce.date().nullable().optional(),
})

// --- Actions ---

export async function generateMealIdeas() {
    const inventory = await getInventory();
    const dict = await getDictionary();

    if (inventory.length === 0) {
        return { error: dict.errors.emptyPantry };
    }

    const inventoryList = inventory.map((item: InventoryItem) => `${item.name} (${item.quantity} ${item.unit})`).join(', ');

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
                        ingredients: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    name: { type: SchemaType.STRING },
                                    quantityPerPerson: { type: SchemaType.NUMBER },
                                    unit: { type: SchemaType.STRING }
                                },
                                required: ["name", "quantityPerPerson", "unit"]
                            }
                        }
                    },
                    required: ["name", "description", "ingredients"]
                }
            }
        }
    });

    const prompt = `Given the following grocery inventory: ${inventoryList}

Suggest 3 balanced meal combos. For each combo:
1. Provide an appetizing name and brief description.
2. List the specific inventory items used.
3. For each item used, estimate the realistic quantity needed PER PERSON, using the EXACT name and unit provided in the inventory list.
4. Assume basic staples (oil, salt, pepper) are available.

Focus on "meal combos" (e.g. Protein + Side + Vegetable).`;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
}

export async function consumeMeal(ingredients: { name: string, quantity: number }[]) {
    const householdId = await requireAuth();

    await prisma.$transaction(async (tx) => {
        for (const ingredient of ingredients) {
            const item = await tx.inventoryItem.findFirst({
                where: { name: ingredient.name, householdId }
            });

            if (item) {
                const newQuantity = Math.max(0, item.quantity - ingredient.quantity);

                if (newQuantity <= 0) {
                    await tx.inventoryItem.delete({
                        where: { id: item.id }
                    });
                } else {
                    await tx.inventoryItem.update({
                        where: { id: item.id },
                        data: { quantity: newQuantity }
                    });
                }
            }
        }
    });

    revalidatePath('/');
    revalidatePath('/generator');
}

export async function getInventory() {
    // Read operations degrade gracefully — return empty if not logged in.
    // Write operations (add/delete/consume) use requireAuth() which throws.
    const session = await auth();
    if (!session?.user?.id) return [];
    
    // We also need to get the user's householdId for read
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { householdId: true }
    });
    
    if (!user?.householdId) return [];
    
    return prisma.inventoryItem.findMany({
        where: { householdId: user.householdId },
        orderBy: { addedAt: 'desc' }
    });
}

export async function addInventoryItems(rawItems: { name: string, category: string, quantity: number, unit?: string, confidenceScore: number, expiresAt?: Date, minThreshold?: number }[]) {
    const householdId = await requireAuth();

    const items = AddItemsSchema.parse(rawItems);

    // 1. Aggregate items with the same name in the input batch to reduce DB calls.
    // This handles cases where the same item appears multiple times in a single scan.
    const itemMap = new Map<string, typeof items[number]>();
    for (const item of items) {
        const existing = itemMap.get(item.name);
        if (existing) {
            existing.quantity += item.quantity;
            if (item.minThreshold !== undefined) {
                existing.minThreshold = (existing.minThreshold ?? 0) + item.minThreshold;
            }
        } else {
            itemMap.set(item.name, { ...item });
        }
    }
    const aggregatedItems = Array.from(itemMap.values());

    // 2. Process items in a transaction to ensure atomicity.
    // We check for existing items by name and update quantity if found, 
    // otherwise create a new entry.
    await prisma.$transaction(async (tx) => {
        for (const item of aggregatedItems) {
            const existingItem = await tx.inventoryItem.findFirst({
                where: { name: item.name, householdId }
            });

            if (existingItem) {
                await tx.inventoryItem.update({
                    where: { id: existingItem.id },
                    data: {
                        quantity: {
                            increment: item.quantity
                        }
                    }
                });
            } else {
                await tx.inventoryItem.create({
                    data: {
                        name: item.name,
                        category: item.category,
                        quantity: item.quantity,
                        unit: item.unit,
                        confidenceScore: item.confidenceScore,
                        expiresAt: item.expiresAt,
                        minThreshold: item.minThreshold,
                        householdId: householdId,
                    }
                });
            }
        }
    });

    // Purge the dashboard's server-side cache so new items appear immediately.
    revalidatePath('/');
}

export async function deleteInventoryItem(rawId: string) {
    const householdId = await requireAuth();


    const { id } = DeleteItemSchema.parse({ id: rawId });

    // Ensure they can only delete an item from their household
    await prisma.inventoryItem.deleteMany({
        where: { id, householdId }
    });
    revalidatePath('/');
}

export async function updateInventoryItem(rawData: { id: string, name: string, category: string, quantity: number, unit?: string, minThreshold?: number, expiresAt?: Date | null }) {
    const userId = await requireAuth();

    const { id, ...data } = UpdateItemSchema.parse(rawData);

    // Ensure the item belongs to the authenticated user before updating.
    const existing = await prisma.inventoryItem.findFirst({
        where: { id, userId }
    });

    if (!existing) {
        throw new Error('Item not found');
    }

    await prisma.inventoryItem.update({
        where: { id },
        data: {
            name: data.name,
            category: data.category,
            quantity: data.quantity,
            unit: data.unit,
            minThreshold: data.minThreshold,
            expiresAt: data.expiresAt,
        }
    });

    revalidatePath('/');
}
