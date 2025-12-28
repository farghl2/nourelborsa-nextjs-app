import { prisma } from "@/lib/prisma";
import { resetPurificationCount } from "@/lib/purification";

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

  // 2. Get plan details
  if (!payment.planId) {
    return { success: false, error: "No plan associated with payment" };
  }

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: payment.planId },
  });

  if (!plan) {
    return { success: false, error: "Plan not found" };
  }

  // 3. Perform all operations in a transaction for atomicity
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Update payment status
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCEEDED",
          transactionId: transactionId || payment.transactionId,
        },
      });

      // Deactivate any existing active subscription for the SAME plan
      await tx.subscription.updateMany({
        where: {
          userId: payment.userId,
          planId: payment.planId!, // Non-null asserted - we checked above
          status: "ACTIVE",
        },
        data: {
          status: "EXPIRED",
        },
      });

      // Create new subscription
      const subscription = await tx.subscription.create({
        data: {
          userId: payment.userId,
          planId: payment.planId!,
          status: "ACTIVE",
          paymentId: payment.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000),
          allowedStocks: plan.allowedStocks,
        },
      });

      // Update purification count
      await tx.user.update({
        where: { id: payment.userId },
        data: { purificationCount: plan.purificationLimit ?? 0 },
      });

      return { payment: updatedPayment, subscription };
    });

    return { success: true, ...result };
  } catch (error) {
    console.error("Transaction failed in fulfillPayment:", error);
    return { success: false, error: "Failed to process payment" };
  }
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
  return await prisma.payment.updateMany({
    where: {
      OR: [
        { id: paymentIdOrReference },
        { merchantReference: paymentIdOrReference },
      ],
      status: "PENDING",
    },
    data: {
      status: "CANCELLED",
    },
  });
}
