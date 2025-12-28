import { NextResponse } from "next/server";
import { fulfillPayment, failPayment } from "@/lib/payments/fulfillment";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid or empty JSON" }, { status: 400 });
    }
    
    console.log("PaySky Webhook received:", JSON.stringify(body, null, 2));

    // PaySky fields might vary in casing
    const MerchantReference = body.MerchantReference || body.merchantReference || body.merchant_reference || body.ExternalReference;
    const Success = body.Success !== undefined ? body.Success : (body.success !== undefined ? body.success : body.Status);
    const NetworkReference = body.NetworkReference || body.networkReference || body.transactionId || body.TransactionID || body.SystemReference;

    if (!MerchantReference) {
      console.warn("Webhook received without MerchantReference:", body);
      return NextResponse.json({ error: "Missing MerchantReference" }, { status: 400 });
    }

    // Success codes: true, "true", "00", "000", "Success", "Approved"
    const successValue = String(Success || body.Message || "").toLowerCase();
    const isSuccess = 
      Success === true || 
      Success === "true" || 
      ["00", "000", "success", "approved"].includes(successValue);
      
    if (isSuccess) {
      const result = await fulfillPayment(String(MerchantReference), NetworkReference ? String(NetworkReference) : undefined);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 404 });
      }
      return NextResponse.json({ success: true, alreadyProcessed: (result as any).alreadyProcessed });
    } else {
      await failPayment(String(MerchantReference));
      return NextResponse.json({ success: false, message: "Payment failed according to webhook" });
    }
  } catch (error) {
    console.error("PaySky Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Optionally handle GET if PaySky sends callback as GET
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const body = Object.fromEntries(searchParams.entries());
    console.log("PaySky GET Callback received:", body);
    
    const MerchantReference = body.MerchantReference || body.merchantReference || body.ref;
    const Success = body.Success || body.success || body.status || body.Status;
    
    if (!MerchantReference) {
        console.warn("PaySky Callback received without MerchantReference:", body);
        return NextResponse.redirect(new URL("/pricing", req.url));
    }

    const successValue = String(Success || "").toLowerCase();
    // URL search params are always strings, so we only check for string values
    const isSuccess = Success === "true" || ["00", "000", "success", "approved"].includes(successValue);

    if (isSuccess) {
        await fulfillPayment(String(MerchantReference));
        return NextResponse.redirect(new URL(`/payments/success?ref=${MerchantReference}`, req.url));
    }

    await failPayment(String(MerchantReference));
    return NextResponse.redirect(new URL(`/pricing?error=payment_failed&ref=${MerchantReference}`, req.url));
}

