"use client";

export default function PayButton() {
  const pay = async () => {
    const amount = "10000"; // مثال: 100 جنيه
    const merchantReference = `ORDER-${Date.now()}`;

    const res = await fetch("/api/paysky/hash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, merchantReference }),
    });

    const data = await res.json();

    // @ts-ignore
    Lightbox.Checkout.configure = {
      MID: data.MID,
      TID: data.TID,
      AmountTrxn: amount,
      SecureHash: data.SecureHash,
      MerchantReference: merchantReference,
      TrxDateTime: data.TrxDateTime,

      completeCallback: (response: any) => {
        console.log("Payment Success", response);
      },
      errorCallback: (error: any) => {
        console.error("Payment Error", error);
      },
      cancelCallback: () => {
        console.log("Payment Cancelled");
      },
    };

    // @ts-ignore
    Lightbox.Checkout.showLightbox();
  };

  return (
    <button
      onClick={pay}
      className="px-4 py-2 bg-green-600 text-white rounded"
    >
      Pay Now
    </button>
  );
}
