# Authentication & Authorization

This document describes the authentication architecture for Larder & Leaf.

---

## Overview

Authentication is handled by **Auth.js** (NextAuth v5) with the **Prisma Adapter**, storing user and session data directly in the application's SQLite database. The system supports two modes of operation:

1. **Authenticated Mode** — Users sign in via OAuth (Google or GitHub). All routes are protected and data is scoped per-user.
2. **Demo Mode** — Enabled via `DEMO_MODE=true`. Bypasses all authentication, automatically creates a synthetic "Demo User", and grants immediate access to the full application.

---

## Architecture

### File Structure

```
proxy.ts                          # Next.js 16 proxy — UX redirect layer
src/
├── auth.ts                       # NextAuth configuration (providers, adapter, callbacks)
├── lib/
│   └── auth.ts                   # auth() and requireAuth() helpers (demo mode logic)
├── app/
│   ├── (auth)/                   # Route group with minimal layout (no sidebar/nav)
│   │   ├── layout.tsx            # Centered, clean layout for login
│   │   └── login/page.tsx        # OAuth sign-in buttons
│   └── api/
│       └── auth/[...nextauth]/   # Auth.js API route handlers
```

### Auth Flow

```
Request → proxy.ts (cookie check / redirect)
       → Server Component / Action → auth() or requireAuth()
       → Prisma (scoped by userId)
```

### Defense in Depth

Authentication is enforced at **two layers**:

1. **Proxy layer (`proxy.ts`)** — Checks for the Auth.js session cookie. Redirects unauthenticated users to `/login`. This is a UX convenience, not a security boundary.
2. **Server layer (`requireAuth()`)** — Every server action and API route calls `requireAuth()` before touching the database. This is the real security boundary. Even if the proxy is bypassed, unauthorized requests will throw.

---

## Providers

Currently configured:

- **Google** (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`)
- **GitHub** (`AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`)

### Adding a New Provider

Auth.js supports 80+ providers. To add one:

1. Import it in `src/auth.ts`:
   ```ts
   import Discord from "next-auth/providers/discord";
   ```
2. Add it to the `providers` array:
   ```ts
   providers: [GitHub, Google, Discord],
   ```
3. Add the corresponding `AUTH_DISCORD_ID` and `AUTH_DISCORD_SECRET` to your `.env`.
4. Add a sign-in button to `src/app/(auth)/login/page.tsx`.

No database changes are needed — the Prisma adapter handles new providers automatically.

---

## Demo Mode

When `DEMO_MODE=true` (and `NEXT_PUBLIC_DEMO_MODE=true` for client components):

- **Proxy**: Allows all requests through without checking for a session cookie.
- **`auth()`**: Returns a synthetic session with a hardcoded "Demo User".
- **Database**: The demo user is automatically upserted into the `User` table on first access, ensuring foreign key constraints on `InventoryItem.userId` are satisfied.
- **UI**: The "Sign Out" button in the TopNav is hidden.

### Environment Variables

Both `DEMO_MODE` and `NEXT_PUBLIC_DEMO_MODE` must be set together. The `NEXT_PUBLIC_` prefix is required for client-side components to read the value.

```env
DEMO_MODE=true
NEXT_PUBLIC_DEMO_MODE=true
```

---

## Environment Variables Reference

| Variable                | Required | Description                                                             |
| ----------------------- | -------- | ----------------------------------------------------------------------- |
| `AUTH_SECRET`           | Yes      | Secret key for signing JWTs. Generate with `npx auth secret`.           |
| `AUTH_GOOGLE_ID`        | No\*     | Google OAuth Client ID                                                  |
| `AUTH_GOOGLE_SECRET`    | No\*     | Google OAuth Client Secret                                              |
| `AUTH_GITHUB_ID`        | No\*     | GitHub OAuth Client ID                                                  |
| `AUTH_GITHUB_SECRET`    | No\*     | GitHub OAuth Client Secret                                              |
| `AUTH_URL`              | Prod     | Base URL of the app in production (e.g., `https://yourapp.railway.app`) |
| `DEMO_MODE`             | No       | Set to `"true"` to bypass auth (server-side)                            |
| `NEXT_PUBLIC_DEMO_MODE` | No       | Set to `"true"` to hide auth UI (client-side)                           |

\*Required when `DEMO_MODE` is `false`.

---

## Security Considerations

- **XSS Protection**: Auth.js stores session tokens in `HttpOnly`, `Secure` cookies that are inaccessible to client-side JavaScript.
- **CSRF Protection**: Auth.js includes built-in CSRF token validation on all state-changing requests (sign-in, sign-out).
- **User Isolation**: All database queries in server actions are scoped by `userId`. A user can never read, modify, or delete another user's inventory items.
- **API Protection**: The `/api/vision` route requires authentication, preventing unauthenticated users from consuming Gemini API quota.

---

## Database Schema

Auth.js requires the following models (managed by the Prisma Adapter):

- `User` — Stores user profile info from OAuth providers.
- `Account` — Links OAuth provider accounts to users.
- `Session` — Tracks active sessions.
- `VerificationToken` — Used for email verification flows (not currently active).

The `InventoryItem` model has a `userId` foreign key that relates items to their owner:

```prisma
model InventoryItem {
  userId  String
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Cascade delete ensures that when a user is removed, all their inventory items are cleaned up automatically.
