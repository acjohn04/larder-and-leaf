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
   ├── getInventory()      →  Prisma query (household-scoped via requireAuth(), ordered by addedAt desc)
   ├── getDictionary()     →  i18n strings
   ├── Search filter       →  Client-side name/category substring match (reads ?q)
   └── Category filter     →  Exact match on category field (reads ?category)
        │
        ▼
  Rendered HTML (stat cards + DashboardGrid client component)
```

## Sections

### Hero Header

- Page title and subtitle pulled from the i18n dictionary (`dict.dashboard.title`).
- Primary CTA linking to `/intake` for adding receipts.

### Stat Cards (Bento Grid)

Three summary cards in a responsive `md:grid-cols-3` layout:

| Card              | Logic                                                                                     | Visual           |
| ----------------- | ----------------------------------------------------------------------------------------- | ---------------- |
| **Total Items**   | `filteredInventory.length` — adapts label to "Search Results" when a `?q` param is active | Primary color    |
| **Expiring Soon** | Items where `expiresAt` is within the next 3 days and not already expired                 | Error/red color  |
| **Low Stock**     | Items where `minThreshold > 0` and `quantity <= minThreshold`                             | Container accent |

### Category & Search Filters

Rendered by the `<CategoryFilter />` client component. This component combines category selection and a debounced search input.

- **Categories:** Filters manipulate URL search params (`?category=`) via `router.replace()`.
- **Search:** A debounced (300ms) input that writes `?q=` to the URL.
- **Available categories:** All Items, Produce, Dairy & Eggs, Pantry, Meat & Seafood, Bakery, Frozen.

See [`src/components/CategoryFilter.tsx`](../src/components/CategoryFilter.tsx).

### Inventory Grid

Rendered by the `<DashboardGrid />` client component. This receives the filtered inventory items and a serialized `now` timestamp from the server.

A responsive card grid (`sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`). Each card displays:

- **Item name** with an "Expiring" badge if within the 3-day window **and not already expired**.
- **Category** label.
- **Quantity & unit** — quantity text turns red if the item is low stock (`quantity <= minThreshold`).
- **Delete button** — triggers a confirmation modal before removing the item via the `deleteInventoryItem` server action. Uses `stopPropagation` to prevent opening the edit modal.
- **Click-to-edit** — clicking anywhere on the card (except the delete button) opens the `EditItemModal` pre-filled with the item's current data.

See [`src/components/DashboardGrid.tsx`](../src/components/DashboardGrid.tsx).

#### Expiring Badge Logic

Both the stat card count and the per-card badge use the same window: `expiresAt` must be in `[now, now + 3 days]`. Items already past their expiration date do **not** receive the badge or count toward "Expiring Soon".

### Empty State

When no items match the current filters, a centered empty-state panel is shown with a CTA linking to `/intake`.

## Key Components Used

| Component        | Role                                                                                |
| ---------------- | ----------------------------------------------------------------------------------- |
| `DashboardGrid`  | Client component rendering the item card grid with click-to-edit and delete support |
| `EditItemModal`  | Modal for editing an existing item; calls `updateInventoryItem` server action       |
| `CategoryFilter` | Combined search input and category toggle buttons; manages URL params               |
| `DeleteButton`   | Triggers `DeleteConfirmModal` → calls `deleteInventoryItem` server action           |
| `TopNav`         | Global navigation bar with brand logo and Sign Out button (hidden in demo mode)     |
