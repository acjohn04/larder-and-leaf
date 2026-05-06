# Design System Specification: Larder & Leaf

This design system is a bespoke framework crafted for a premium grocery inventory experience. It moves away from the sterile, rigid grids of traditional utility apps, instead embracing an "Editorial Pantry" aesthetic. By prioritizing tonal depth over structural lines and using a sophisticated, nature-inspired palette, we create an interface that feels as fresh as the produce it tracks.

---

## 1. Overview & Creative North Star

**Creative North Star: "The Digital Market Stand"**
The goal is to evoke the feeling of a high-end, organized larder. We break the "template" look by using **intentional asymmetry** and **tonal layering**. Instead of boxing items into a grid, we use expansive white space and overlapping elements to create a sense of breathability and premium quality. The interface should feel tactile—like touching matte cardstock or frosted glass—rather than a flat digital screen.

---

## 2. Colors & Surface Philosophy

The palette is rooted in the "Fresh Mint" (`primary`) and "Ripe Tomato" (`tertiary`) profiles, supported by a sophisticated range of "Pantry White" neutrals.

### The "No-Line" Rule

**Strict Mandate:** Designers are prohibited from using 1px solid borders to section off content.
Boundaries must be defined through background color shifts or subtle tonal transitions. For example, a specialized inventory category should sit on a `surface-container-low` (#eff1f0) block against a `surface` (#f6f7f6) backdrop.

### Surface Hierarchy & Nesting

Treat the UI as a physical stack of fine paper.

- **Base Level:** `surface` (#f6f7f6) for the overall app background.
- **Secondary Level:** `surface-container-low` (#eff1f0) for grouping related inventory items.
- **Priority Level:** `surface-container-lowest` (#ffffff) for high-interaction cards (e.g., an active shopping list item).

### The "Glass & Gradient" Rule

To elevate the app beyond a standard utility:

- **Floating Elements:** Use Glassmorphism for navigation bars. Apply a semi-transparent `surface` color with a 20px backdrop-blur.
- **Signature Textures:** For primary CTAs (e.g., "Add Receipt"), use a subtle linear gradient from `primary` (#006949) to `primary_dim` (#005b3f) at a 135-degree angle. This adds "soul" and depth that flat color cannot replicate.

---

## 3. Typography

The system utilizes two distinct typefaces to balance editorial flair with high utility.

- **Display & Headlines:** `plusJakartaSans` — A modern, friendly sans-serif with a wide stance that feels welcoming and premium.
- **Body & Labels:** `beVietnamPro` — Optimized for legibility at small scales, perfect for reading expiration dates and quantity counts.

### Typography Scale

- **Display-LG (3.5rem):** Used for hero moments, like "Welcome to your Pantry."
- **Headline-SM (1.5rem):** Used for category titles (e.g., "Dairy & Eggs").
- **Title-SM (1rem):** Bold weight for item names in a list.
- **Label-MD (0.75rem):** Used for metadata like "Expires in 2 days."

---

## 4. Elevation & Depth

We achieve hierarchy through **Tonal Layering** and **Ambient Shadows** rather than traditional strokes.

### The Layering Principle

Stacking surfaces creates natural depth.

- _Example:_ A `surface-container-lowest` (#ffffff) card placed on top of a `surface-container` (#e6e9e8) section provides a soft, organic lift.

### Ambient Shadows

When a "floating" effect is required (e.g., a modal or a floating action button):

- **Blur:** 32px to 64px.
- **Opacity:** 4%–6%.
- **Tint:** Use a 10% opacity version of `on_surface` (#2c2f2f) instead of pure black to mimic natural light.

### The "Ghost Border" Fallback

If an edge _must_ be defined for accessibility, use the `outline_variant` (#acadad) at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components

### Buttons

- **Primary:** Gradient fill (`primary` to `primary_dim`), full round (pill-shaped) corners. Highly tactile.
- **Secondary:** `surface-container-high` (#e0e3e2) background with `on_primary_container` (#006042) text.
- **Tertiary:** Ghost style—no background, only `title-sm` typography in `primary` color.

### Inventory Cards

- **Construction:** Use `surface-container-low` (#eff1f0) with `2xl` (1rem) rounded corners.
- **Spacing:** Use `spacing-5` (1.25rem) internal padding.
- **Rule:** **No dividers.** Separate "Item Name" from "Quantity" using a vertical `spacing-2` (0.5rem) gap.

### Input Fields

- **Background:** `surface-container-low` (#eff1f0).
- **Active State:** Shift background to `surface-container-lowest` (#ffffff) and apply a "Ghost Border" of `primary` at 20% opacity.
- **Error:** Background shifts to `on_error` (#ffefee) with text in `error` (#b31b25).

### Search Bar (Integrated)

Instead of a hidden global search, the search bar is integrated into the dashboard's filter row. It uses a pill-shaped `surface-container-low` background with a subtle focus ring, ensuring it feels like a native part of the inventory browsing experience.

---

## 6. Do’s and Don’ts

### Do

- **Use Asymmetry:** Place product imagery slightly off-center or overlapping container edges to create an editorial feel.
- **Prioritize Breathing Room:** Use `spacing-8` (2rem) between major sections to emphasize the "Pantry White" cleanliness.
- **Respect the Mint:** Use `primary` (#006949) sparingly for high-value actions only.

### Don’t

- **No Hard Dividers:** Never use a 1px line to separate list items. Use white space (`spacing-3`) or subtle background alternating.
- **No Harsh Shadows:** Avoid small, dark "drop shadows" that look like 2010-era UI.
- **No Pure Black:** Ensure all "black" text uses `on_surface` (#2c2f2f) for a softer, more organic read.
