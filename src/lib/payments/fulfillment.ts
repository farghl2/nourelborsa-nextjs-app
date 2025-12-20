import { prisma } from "@/lib/prisma";

export async function fulfillPayment(paymentIdOrReference: string, transactionId?: string) {
  // 1. Find the payment
  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        { id: paymentIdOrReference },
        { merchantReference: paymentIdOrReference },
      ],
    },
    include: {
      user: true,
    },
  });

  if (!payment) {
    console.error(`Payment not found for reference: ${paymentIdOrReference}`);
    return { success: false, error: "Payment not found" };
  }

  if (payment.status === "SUCCEEDED") {
    return { success: true, payment, alreadyProcessed: true };
  }

  // 2. Mark payment as succeeded
  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "SUCCEEDED",
      transactionId: transactionId || payment.transactionId,
    },
  });

  // 3. Create or update subscription if planId exists
  if (payment.planId) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: payment.planId },
    });

    if (plan) {
      // Deactivate any existing active subscriptions for this user
      await prisma.subscription.updateMany({
        where: {
          userId: payment.userId,
          status: "ACTIVE",
        },
        data: {
          status: "EXPIRED",
        },
      });

      // Create new subscription
      const subscription = await prisma.subscription.create({
        data: {
          userId: payment.userId,
          planId: payment.planId,
          status: "ACTIVE",
          paymentId: payment.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000),
          allowedStocks: plan.allowedStocks,
        },
      });

      // Update user's purification count if plan specifies it
      if (plan.purificationLimit !== null && plan.purificationLimit !== undefined) {
        await prisma.user.update({
          where: { id: payment.userId },
          data: {
            purificationCount: plan.purificationLimit,
          },
        });
      }

      return { success: true, payment: updatedPayment, subscription };
    }
  }

  return { success: true, payment: updatedPayment };
}

export async function failPayment(paymentIdOrReference: string, error?: string) {
  return await prisma.payment.updateMany({
    where: {
      OR: [
        { id: paymentIdOrReference },
        { merchantReference: paymentIdOrReference },
      ],
      status: "PENDING",
    },
    data: {
      status: "FAILED",
    },
  });
}

export async function cancelPayment(paymentIdOrReference: string) {
  // We keep it as PENDING or mark as FAILED? Usually FAILED or a new CANCELLED status.
  // Prisma schema PaymentStatus only has SUCCEEDED, PENDING, FAILED.
  // I'll use FAILED for cancellation as well or keep it pending. 
  // Better to mark as FAILED to clean up.
  return await prisma.payment.updateMany({
    where: {
      OR: [
        { id: paymentIdOrReference },
        { merchantReference: paymentIdOrReference },
      ],
      status: "PENDING",
    },
    data: {
      status: "FAILED",
    },
  });
}
