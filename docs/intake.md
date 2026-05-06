# Intake Scanner (`/intake`)

The intake scanner allows users to upload photos of grocery receipts or produce and have items automatically identified by Google Gemini Vision. This is a **client component** with local state managing the upload, analysis, review, and save lifecycle.

**Source:** [`src/app/intake/page.tsx`](../src/app/intake/page.tsx)

---

## User Flow

```
1. User clicks upload zone → file picker opens
2. User selects an image (receipt or produce photo)
3. Image is POSTed to /api/vision as FormData
4. Gemini Vision analyzes the image and returns structured JSON
5. Scanned items are displayed in a review panel
6. User clicks "Add to Inventory" → items saved via server action
7. Success confirmation shown; items cleared
8. Success state automatically clears after 5 seconds
```

## Layout

The page uses a two-column layout on desktop (`lg:grid-cols-12`):

| Column             | Content                                       |
| ------------------ | --------------------------------------------- |
| **Left (7 cols)**  | Upload drop zone + error messages             |
| **Right (5 cols)** | Scanned items review panel (sticky on scroll) |

## Upload Zone

A clickable container with a hidden `<input type="file" accept="image/*">`. Clicking anywhere on the zone triggers the file picker. The zone is disabled during analysis to prevent duplicate uploads.

**States:**

- **Idle** — "Drop receipt or photo here" prompt with an upload icon
- **Analyzing** — Reduced opacity, cursor disabled, "Analyzing image..." text

## Vision API Integration

When a file is selected, the component:

1. Creates a `FormData` with the image under the `"image"` key.
2. Sends a `POST` request to `/api/vision`.
3. The API route (`src/app/api/vision/route.ts`) performs:
   - **File validation** — max 10 MB, allowed MIME types: JPEG, PNG, WebP, HEIC/HEIF.
   - **Base64 conversion** — the image is converted for inline Gemini API input.
   - **Gemini Vision call** — uses `gemini-2.5-flash` with a structured prompt requesting item identification at >80% confidence.
   - **Automated Thresholds** — The prompt instructs Gemini to calculate a `min_threshold` (generally 20% of the current quantity) to automate low-stock alerts.
   - **Retry logic** — up to 3 attempts with linear backoff (1s, 2s, 3s) on API failures.
   - **JSON parsing** — the response is parsed and returned as `{ items: [...] }`.

### Response Shape (per item)

```typescript
interface IntakeItem {
  uid: string;
  name: string;
  category: string; // produce, pantry, dairy_eggs, meat_seafood, bakery, frozen, prepared_meals
  quantity: { current: number; unit: string };
  expires_in_days: number;
  metadata: {
    is_barcode: boolean;
    confidence: number; // 0.0–1.0
    added_at: string; // ISO date
    freshness_rating: number; // 1–5
    status: string; // "use_immediately" | "pantry" | "refrigerated" | "frozen"
    min_threshold: number; // Automated low-stock trigger (e.g. 20% of quantity)
  };
}
```

## Review Panel (Right Column)

Three states for the right panel:

| State               | Display                                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Analyzing**       | Spinner + "Analyzing..." text                                                                                                       |
| **Items found**     | Scrollable list of item cards with name, quantity, category, status, and confidence score. "Add to Inventory" button at the bottom. |
| **Empty / Success** | Either "No items scanned yet" prompt, or a green checkmark "Saved Successfully!" confirmation.                                      |

## Saving to Inventory

When the user confirms, the component:

1. Maps each `IntakeItem` to the server action's expected shape, computing `expiresAt` from `expires_in_days` and including `minThreshold`.
2. Calls `addInventoryItems()` — a Zod-validated server action that handles bulk-insertion and merges quantities for duplicate items.
3. On success, clears scanned items and shows the success state.
4. Calls `revalidatePath('/')` so the dashboard reflects the new items.

## Error Handling

- API errors (non-200 responses) display the error message from the response body.
- Network/unexpected errors fall back to the `dict.errors.analysisFailed` string.
- Save failures display `dict.errors.saveFailed`.
- All errors are shown in a styled error banner below the upload zone.
