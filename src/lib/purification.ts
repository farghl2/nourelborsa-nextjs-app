import { prisma } from "@/lib/prisma";

/**
 * Updates a user's purification count to match their active subscription plan's limit.
 * This should be called whenever a subscription becomes active.
 * 
 * @param userId - The ID of the user to update
 * @param planId - The ID of the subscription plan
 * @returns The updated purification count
 */
export async function updatePurificationCount(userId: string, planId: string): Promise<number> {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
    select: { purificationLimit: true }
  });

  const purificationCount = plan?.purificationLimit ?? 0;

  await prisma.user.update({
    where: { id: userId },
    data: { purificationCount }
  });

  return purificationCount;
}

/**
 * Resets a user's purification count to the specified plan's limit.
 * Use this when activating a subscription.
 * 
 * @param userId - The ID of the user
 * @param purificationLimit - The purification limit from the plan
 * @returns The updated user
 */
export async function resetPurificationCount(userId: string, purificationLimit: number | null) {
  return await prisma.user.update({
    where: { id: userId },
    data: { purificationCount: purificationLimit ?? 0 },
    select: { purificationCount: true }
  });
}
