import { NextResponse } from "next/server";
import CryptoJS from "crypto-js";

export async function POST(req: Request) {
  try {
    const { amount, merchantReference } = await req.json();

    const MID = process.env.PAYSKY_MID?.trim()!;
    const TID = process.env.PAYSKY_TID?.trim()!;
    const SECRET = process.env.PAYSKY_SECRET?.trim()!;

    if (!MID || !TID || !SECRET) {
      return NextResponse.json({ error: "PaySky configuration missing" }, { status: 500 });
    }

    // Use toGMTString as requested by user, casting to any because of TS declaration issues in some environments
    const TrxDateTime = (new Date() as any).toGMTString();

    const hashing = `Amount=${amount}&DateTimeLocalTrxn=${TrxDateTime}&MerchantId=${MID}&MerchantReference=${merchantReference}&TerminalId=${TID}`;

    const secretKeyWordArray = CryptoJS.enc.Hex.parse(SECRET);
    const hmac = CryptoJS.HmacSHA256(hashing, secretKeyWordArray);
    const SecureHash = hmac.toString(CryptoJS.enc.Hex).toUpperCase();

    console.log("PaySky Hashing String:", hashing);
    console.log("PaySky Generated Hash:", SecureHash);

    return NextResponse.json({
      MID,
      TID,
      SecureHash,
      TrxDateTime,
    });
  } catch (error) {
    console.error("Error generating PaySky hash:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
