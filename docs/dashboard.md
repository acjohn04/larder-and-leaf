# Dashboard (`/`)

The dashboard is the landing page and primary inventory view. It is a **server component** that fetches the full inventory on each request, applies search and category filters, and renders stat cards alongside an item grid.

**Source:** [`src/app/page.tsx`](../src/app/page.tsx)

---

## Data Flow

```
URL search params (?q=...&category=...)
        │
        ▼
  Server Component
  ├── getInventory()      →  Prisma query (all items, ordered by addedAt desc)
  ├── getDictionary()     →  i18n strings
  ├── Search filter       →  Client-side name/category substring match
  └── Category filter     →  Exact match on category field
        │
        ▼
  Rendered HTML (stat cards + item grid)
```

## Sections

### Hero Header

- Page title and subtitle pulled from the i18n dictionary (`dict.dashboard.title`).
- Primary CTA linking to `/intake` for adding receipts.

### Stat Cards (Bento Grid)

Three summary cards in a responsive `md:grid-cols-3` layout:

| Card | Logic | Visual |
|---|---|---|
| **Total Items** | `filteredInventory.length` — adapts label to "Search Results" when a `?q` param is active | Primary color |
| **Expiring Soon** | Items where `expiresAt` is within the next 3 days and not already expired | Error/red color |
| **Low Stock** | Items where `quantity <= minThreshold` and `minThreshold > 0` | Container accent |

### Category Filters

Rendered by the `<CategoryFilter />` client component. Filters manipulate URL search params (`?category=`) via `router.replace()`, preserving the current search query.

**Available categories:** All Items, Produce, Dairy & Eggs, Pantry, Meat & Seafood.

See [`src/components/CategoryFilter.tsx`](../src/components/CategoryFilter.tsx).

### Inventory Grid

A responsive card grid (`sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`). Each card displays:

- **Item name** with an "Expiring" badge if within the 3-day window.
- **Category** label.
- **Quantity & unit** — quantity text turns red if the item is low stock.
- **AI confidence score** — shown as a percentage with a robot icon; only visible if the item was added via the scanner. Fades in on hover.
- **Delete button** — triggers a confirmation modal before removing the item via the `deleteInventoryItem` server action.

### Empty State

When no items match the current filters, a centered empty-state panel is shown with a CTA linking to `/intake`.

## Search

Search is handled by the `<TopNav />` component. It uses a **debounced** (300ms) `useEffect` that writes a `?q=` search param to the URL. The dashboard server component reads this param and filters items by name or category substring match (case-insensitive).

**Important:** The TopNav skips search navigation on initial mount to avoid a redundant router push on page load.

## Key Components Used

| Component | Role |
|---|---|
| `CategoryFilter` | Client-side URL-param category toggle buttons |
| `DeleteButton` | Triggers `DeleteConfirmModal` → calls `deleteInventoryItem` server action |
| `TopNav` | Debounced search input that writes `?q=` to URL |
