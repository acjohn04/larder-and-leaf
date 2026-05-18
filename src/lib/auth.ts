import { nextAuth } from "../auth"
import { prisma } from "./prisma"
import type { Session } from "next-auth"

const DEMO_USER = {
  id: "demo-user-id",
  name: "Demo User",
  email: "demo@larderandleaf.app",
}

/**
 * Returns the current session, or a synthetic demo session when
 * DEMO_MODE is enabled.  On the first demo-mode call the demo user
 * is upserted into the database so foreign-key constraints on
 * InventoryItem.householdId are satisfied.
 */
export async function auth(): Promise<Session | null> {
  if (process.env.DEMO_MODE === "true") {
    await prisma.user.upsert({
      where: { id: DEMO_USER.id },
      update: {},
      create: {
        id: DEMO_USER.id,
        name: DEMO_USER.name,
        email: DEMO_USER.email,
        household: {
          create: {
            name: "Demo Household",
          }
        }
      },
    })

    return {
      user: {
        id: DEMO_USER.id,
        name: DEMO_USER.name,
        email: DEMO_USER.email,
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
  }

  return await nextAuth()
}

/**
 * Convenience wrapper that throws if the user isn't authenticated.
 * Use this at the top of every server action / API route that mutates data.
 *
 * Returns the authenticated user's householdId so callers can scope DB queries.
 * If the user does not have a household yet, one is created automatically.
 */
export async function requireAuth(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, householdId: true }
  })
  
  if (!user) {
    throw new Error("User not found")
  }
  
  if (user.householdId) {
    return user.householdId
  }
  
  // Auto-create a household if the user doesn't have one
  const household = await prisma.household.create({
    data: {
      name: `${user.name || "My"} Household`
    }
  })
  
  await prisma.user.update({
    where: { id: user.id },
    data: { householdId: household.id }
  })
  
  return household.id
}
