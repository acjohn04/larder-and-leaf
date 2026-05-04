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

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Docker & Deployment

This project is configured for containerized deployment using a multi-stage Dockerfile and Docker Compose, optimized for environments like DigitalOcean App Platform or standard Droplets.

### Local Deployment with Docker Compose

You can run the entire application stack locally using Docker Compose. This ensures a consistent environment and automatically mounts a local volume to persist your SQLite database.

```bash
docker compose up --build
```

The app will be available at `http://localhost:3000`.

### DigitalOcean App Platform

To deploy this containerized application on DigitalOcean App Platform:

1. Connect your GitHub repository to a new App Platform app.
2. App Platform will automatically detect the `Dockerfile` and switch to a container-based build.
3. **CRITICAL FOR SQLITE**: To prevent data loss on every deployment, you must attach a **Volume** to your App component.
   - Mount the volume to the container path `/app/data`.
   - Set the `DATABASE_URL` environment variable to `file:/app/data/prod.db`.
4. Set the `GEMINI_API_KEY` environment variable in the App Platform settings.

## Project Structure

```
larder-and-leaf/
├── prisma/
│   └── schema.prisma          # Database schema (InventoryItem model)
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── inventory.ts   # Server actions (CRUD + meal generation)
│   │   ├── api/
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
│   │   ├── CategoryFilter.tsx # URL-param-based category filters
│   │   ├── DeleteButton.tsx   # Inline delete with confirmation
│   │   ├── DeleteConfirmModal.tsx
│   │   ├── DictionaryProvider.tsx # i18n context provider
│   │   ├── MobileNav.tsx      # Bottom tab bar (mobile)
│   │   ├── Sidebar.tsx        # Desktop navigation sidebar
│   │   └── TopNav.tsx         # Top bar with search
│   ├── constants/
│   │   └── navigation.ts     # Shared nav item definitions
│   ├── dictionaries/
│   │   ├── en.json            # English string dictionary
│   │   └── index.ts           # Dictionary loader + types
│   └── lib/
│       ├── gemini.ts          # Gemini AI client singleton
│       └── prisma.ts          # Prisma client singleton
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

## License

Private project.
