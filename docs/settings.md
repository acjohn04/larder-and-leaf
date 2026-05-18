# Household Settings (`/settings`)

The settings page allows users to manage their household collaboration. It provides an interface to invite family members, view current household members, and join existing households using shareable invite codes.

**Source:** [`src/app/(dashboard)/settings/page.tsx`](<../src/app/(dashboard)/settings/page.tsx>)

---

## Architecture & Data Flow

```
User navigates to /settings
         │
         ▼
    Server Component (SettingsPage)
    └── getHouseholdDetails() → Prisma query (scoped by requireAuth(), fetches Household + Users)
         │
         ▼
    Client Component (SettingsClient)
    ├── View & Copy Invite Code
    ├── Reset / Regenerate Invite Code (regenerateInviteCode server action)
    ├── View Household Members list
    └── Join Another Household (joinHousehold server action)
```

## Features

### 1. Household Overview & Invite Code

Every user belongs to a `Household`. By default, a household is created automatically upon their first login if they do not already belong to one.

- **Invite Code:** A unique, shareable code (e.g., UUID/CUID) that grants access to the household's shared pantry.
- **Copy Code:** Uses the `navigator.clipboard` API to copy the code for easy sharing via messaging apps.
- **Reset Code:** Calls the `regenerateInviteCode()` server action to invalidate the previous invite code and generate a new one. This prevents unwanted users from joining using an old code.

### 2. Member Management

Displays a list of all users currently belonging to the household, showing their profile picture (from OAuth), name, and email address.

### 3. Joining an Existing Household

Users can switch to another household by entering an active invite code from a family member or roommate.

- **Form Submission:** Submitting an invite code calls the `joinHousehold(inviteCode)` server action.
- **Household Switch:** The server action verifies the invite code, updates the user's `householdId` in the database, and revalidates the cache (`revalidatePath('/')`).
- **Warning:** Joining a new household disconnects the user from their previous household's inventory.

---

## Server Actions

**Source:** [`src/app/actions/household.ts`](../src/app/actions/household.ts)

| Action                      | Description                                                                 |
| :-------------------------- | :-------------------------------------------------------------------------- |
| `getHouseholdDetails()`     | Fetches the current user's household record and associated user profiles.   |
| `joinHousehold(inviteCode)` | Validates the invite code and updates the calling user's `householdId`.     |
| `regenerateInviteCode()`    | Generates a new `crypto.randomUUID()` invite code for the user's household. |

---

## Security & Isolation

- **Authentication:** All server actions require authentication via `requireAuth()`.
- **Validation:** Invite codes are sanitized and validated using Zod schemas before querying the database.
- **Data Scoping:** Once a user joins a household, all subsequent inventory queries across the app (`getInventory`, `addInventoryItems`, `deleteInventoryItem`, `consumeMeal`) are automatically scoped to the new `householdId`.
