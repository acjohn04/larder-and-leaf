# Larder & Leaf

A premium grocery inventory management application powered by AI. Scan receipts, track expiration dates, and generate meal ideas — all from a beautifully crafted editorial interface.

## Features

- **📋 Inventory Dashboard** — View, search, and filter your pantry items at a glance with real-time stats for expiring and low-stock items.
- **📸 Intake Scanner** — Upload photos of receipts or produce and let Gemini Vision identify items automatically with confidence scoring.
- **🍽️ Menu Generator** — Generate AI-powered meal combo suggestions based on your current inventory.
- **➕ Manual Entry** — Add items directly via a modal form with category selection.
- **🌍 Internationalization** — Dictionary-based i18n system ready for multi-language expansion (currently English).

## Tech Stack

| Layer      | Technology                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| Framework  | [Next.js 16](https://nextjs.org) (App Router)                                                         |
| Language   | TypeScript                                                                                            |
| Styling    | [Tailwind CSS v4](https://tailwindcss.com) with a custom `@theme` design system                       |
| Database   | SQLite via [Prisma](https://prisma.io) + [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| AI         | [Google Gemini API](https://ai.google.dev) (Vision + Text generation)                                 |
| Validation | [Zod](https://zod.dev) for server action input validation                                             |
| Testing    | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com)                         |
| Fonts      | Plus Jakarta Sans (display) · Be Vietnam Pro (body) · Material Symbols                                |

## Getting Started

### Prerequisites

- Node.js 20+
- A [Google Gemini API key](https://ai.google.dev)

### Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema (creates dev.db)
npx prisma db push

# Start the dev server
npm run dev
```

### Environment Variables

Create a `.env` file in the project root. You can copy `.env.example` as a template.

#### Core Configuration

| Variable         | Description                                                                                        | Default         |
| :--------------- | :------------------------------------------------------------------------------------------------- | :-------------- |
| `GEMINI_API_KEY` | **Required**. Your Google Gemini API key from [AI Studio](https://aistudio.google.com/app/apikey). | -               |
| `DATABASE_URL`   | Prisma connection string for the database.                                                         | `file:./dev.db` |

#### Authentication

| Variable             | Description                                                                                |
| :------------------- | :----------------------------------------------------------------------------------------- |
| `AUTH_SECRET`        | A random string used to sign session cookies. Generate one with `openssl rand -base64 32`. |
| `AUTH_GITHUB_ID`     | GitHub OAuth application Client ID.                                                        |
| `AUTH_GITHUB_SECRET` | GitHub OAuth application Client Secret.                                                    |
| `AUTH_GOOGLE_ID`     | Google Cloud Console OAuth Client ID.                                                      |
| `AUTH_GOOGLE_SECRET` | Google Cloud Console OAuth Client Secret.                                                  |

#### Development Flags

| Variable          | Description                                                                 | Default |
| :---------------- | :-------------------------------------------------------------------------- | :------ |
| `DEMO_MODE`       | If `true`, bypasses real authentication and uses a local "Demo User".       | `false` |
| `USE_MOCK_GEMINI` | If `true`, returns mock JSON from the Vision API instead of calling Gemini. | `false` |

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Docker & Deployment

This project is configured for containerized deployment using a multi-stage Dockerfile and Docker Compose, optimized for modern cloud platforms (e.g., Railway, DigitalOcean, Render).

### Local Deployment with Docker Compose

You can run the entire application stack locally using Docker Compose. This ensures a consistent environment and automatically mounts a local volume to persist your SQLite database.

```bash
docker compose up --build
```

The app will be available at `http://localhost:3000`.

### Cloud Deployment (PaaS)

To deploy this containerized application on a cloud platform:

1. Connect your GitHub repository to your chosen platform.
2. The platform should automatically detect the `Dockerfile` and initiate a container-based build.
3. **CRITICAL FOR SQLITE**: To prevent data loss on every deployment, you must attach a **Persistent Volume**.
   - Mount the volume to the container path `/app/data`.
   - Set the `DATABASE_URL` environment variable to `file:/app/data/prod.db`.
4. Set the `GEMINI_API_KEY` environment variable in the platform's settings.

## Project Structure

```
larder-and-leaf/
├── prisma/
│   └── schema.prisma          # Database schema (InventoryItem model)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx     # Minimal layout for authentication
│   │   │   └── login/
│   │   │       └── page.tsx   # Login page
│   │   ├── actions/
│   │   │   └── inventory.ts   # Server actions (CRUD + meal generation)
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth API endpoints
│   │   │   │   └── [...nextauth]/route.ts
│   │   │   └── vision/
│   │   │       └── route.ts   # POST endpoint for image analysis
│   │   ├── generator/
│   │   │   └── page.tsx       # AI meal generator page
│   │   ├── intake/
│   │   │   └── page.tsx       # Receipt/photo scanner page
│   │   ├── globals.css        # Tailwind theme + custom utilities
│   │   ├── layout.tsx         # Root layout (nav, sidebar, providers)
│   │   └── page.tsx           # Dashboard / inventory overview
│   ├── components/
│   │   ├── AddItemModal.tsx   # Manual item entry form
│   │   ├── AuthSessionProvider.tsx # NextAuth session context provider
│   │   ├── CategoryFilter.tsx # URL-param-based category filters
│   │   ├── DeleteButton.tsx   # Inline delete with confirmation
│   │   ├── DeleteConfirmModal.tsx
│   │   ├── DictionaryProvider.tsx # i18n context provider
│   │   ├── MobileNav.tsx      # Bottom tab bar (mobile)
│   │   ├── Sidebar.tsx        # Desktop navigation sidebar
│   │   └── TopNav.tsx         # Top bar with search
│   ├── constants/
│   │   └── navigation.ts      # Shared nav item definitions
│   ├── dictionaries/
│   │   ├── en.json            # English string dictionary
│   │   └── index.ts           # Dictionary loader + types
│   ├── lib/
│   │   ├── auth.ts            # Auth helper functions (requireAuth, DEMO_MODE)
│   │   ├── gemini.ts          # Gemini AI client singleton
│   │   ├── hooks.ts           # Custom React hooks
│   │   └── prisma.ts          # Prisma client singleton
│   ├── auth.ts                # NextAuth core configuration
│   ├── env.ts                 # Environment variable validation
│   └── proxy.ts               # Next.js 16 proxy for unauthenticated redirects
├── __tests__/                 # Vitest unit + integration tests
├── docs/                      # Page-level documentation
│   ├── design.md              # Design system specification
│   ├── dashboard.md           # Dashboard page docs
│   ├── intake.md              # Intake Scanner page docs
│   └── generator.md           # Menu Generator page docs
└── package.json
```

## Scripts

| Command                 | Description                    |
| ----------------------- | ------------------------------ |
| `npm run dev`           | Start development server       |
| `npm run build`         | Production build               |
| `npm run lint`          | Run ESLint                     |
| `npm test`              | Run tests in watch mode        |
| `npm run test:ci`       | Run tests once (CI mode)       |
| `npm run test:coverage` | Run tests with coverage report |

## Documentation

Page-level documentation lives in the [`docs/`](docs/) directory:

- [Design System](docs/design.md) — Colors, typography, elevation, and component guidelines
- [Dashboard](docs/dashboard.md) — Inventory overview, search, filters, and stat cards
- [Intake Scanner](docs/intake.md) — Image upload, Gemini Vision integration, and item saving
- [Menu Generator](docs/generator.md) — AI meal suggestion generation flow
- [Authentication](docs/auth.md) — Authentication system

## License

Private project.
