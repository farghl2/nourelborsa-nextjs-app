import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { failPayment, cancelPayment } from "@/lib/payments/fulfillment";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { status } = await req.json();

    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    if (payment.userId !== auth.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (status === "FAILED") {
      await failPayment(payment.id);
    } else if (status === "CANCELLED") {
      await cancelPayment(payment.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update payment status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
