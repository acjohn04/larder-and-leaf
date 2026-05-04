import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'
import { env } from '@/env'



// Singleton pattern: store the Prisma client on globalThis to prevent
// creating a new connection on every hot-reload in development.
// In production, a single instance is created on cold start.
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

// Parse the file path from DATABASE_URL, defaulting to dev.db for local fallback
const dbPath = process.env.DATABASE_URL 
  ? process.env.DATABASE_URL.replace(/^file:/, '').replace(/^sqlite:/, '') 
  : 'dev.db';

const adapter = new PrismaBetterSqlite3({ url: dbPath })

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}
