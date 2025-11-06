import { prisma } from "@/lib/prisma"

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const now = new Date()
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      OR: [
        { endDate: null },
        { endDate: { gt: now } },
      ],
    },
    select: { id: true },
  })
  return !!sub
}
