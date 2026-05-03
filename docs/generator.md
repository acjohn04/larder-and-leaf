# Menu Generator (`/generator`)

The menu generator uses Google Gemini to suggest meal combos based on the user's current pantry inventory. This is a **client component** that triggers a server action and displays the AI-generated results.

**Source:** [`src/app/generator/page.tsx`](../src/app/generator/page.tsx)

---

## User Flow

```
1. User clicks "Generate New Ideas"
2. generateMealIdeas() server action is called
3. Server fetches full inventory from the database
4. Inventory is formatted into a text list and sent to Gemini
5. Gemini returns 3 structured meal suggestions
6. Results are displayed as cards
```

## How It Works

### Server Action: `generateMealIdeas()`

**Source:** [`src/app/actions/inventory.ts`](../src/app/actions/inventory.ts)

1. **Fetch inventory** — queries all items via `getInventory()`.
2. **Guard clause** — throws an error if the pantry is empty.
3. **Format prompt** — converts inventory to a readable list: `"Apples (5 pieces), Chicken (2 lbs), ..."`.
4. **Gemini call** — uses `gemini-2.5-flash` with `responseMimeType: "application/json"` and a typed `responseSchema` to enforce structured output.
5. **Parse & return** — the JSON response is parsed and returned directly.

### Gemini Response Schema

The model is constrained to return an array of objects matching:

```typescript
interface MealIdea {
  name: string;            // e.g. "Herb-Crusted Chicken Bowl"
  description: string;     // Appetizing 1-2 sentence description
  mainIngredients: string[]; // Key items from the inventory
}
```

The prompt instructs Gemini to:
- Suggest **3 balanced meal combos** (protein + side + vegetable style).
- Assume basic staples (oil, salt, pepper, water) are available.
- Keep descriptions concise but appetizing.

## UI States

| State | Display |
|---|---|
| **Empty (initial)** | Centered empty state with a restaurant menu icon and prompt text |
| **Loading** | Skeleton cards (3 pulsing placeholders) + button shows spinner with "Consulting Chef Gemini..." |
| **Results** | Three meal cards in a `md:grid-cols-3` grid |
| **Error** | Red error banner with the error message above the content area |

## Meal Cards

Each card displays:

- **Restaurant icon** — in a rounded primary-tinted container.
- **Meal name** — bold heading.
- **Description** — the AI-generated appetizing description.
- **Key Ingredients** — a list of pill-shaped tags showing the main inventory items used.

## Error Handling

- **Empty pantry** — the server action throws with `dict.errors.emptyPantry`, prompting the user to add items first.
- **API failure** — caught client-side; the error message is displayed in a styled banner. Falls back to `dict.errors.generateFailed`.
