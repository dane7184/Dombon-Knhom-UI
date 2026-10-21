import { serverFetch } from "@/lib/server-fetch";

// ============================================================
// PAYMENT — Bakong KHQR
// ============================================================

/**
 * POST /api/v1/payment/qr/image
 * Sends { qr, md5 } and receives a PNG image (binary).
 * Converts the response to a base64 data URL for <img src>.
 */
export async function getPaymentQrImageService(
  qr: string,
  md5: string,
): Promise<{ data: string | null; message: string }> {
  const response = await serverFetch(`payment/qr/image`, {
    method: "POST",
    body: JSON.stringify({ qr, md5 }),
  } as RequestInit);

  if (!response.ok) {
    let message = "Failed to generate QR image.";
    try {
      const result = await response.json();
      message = result.message ?? message;
    } catch {
      // response wasn't JSON (likely binary on success path failing differently)
    }
    console.error(
      JSON.stringify({ httpStatus: response.status, message }, null, 2),
    );
    return { data: null, message };
  }

  // Response is binary image/png — convert to base64 data URL
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUrl = `data:image/png;base64,${base64}`;

  return { data: dataUrl, message: "QR generated" };
}

/**
 * POST /api/v1/payment/transactions/check
 * Sends { md5 }, returns whether the transaction has been paid.
 * responseCode === 0 means paid successfully.
 */
export async function checkPaymentStatusService(
  md5: string,
): Promise<{ isPaid: boolean; message: string }> {
  const response = await serverFetch(`payment/transactions/check`, {
    method: "POST",
    body: JSON.stringify({ md5 }),
  } as RequestInit);

  const result = await response.json();

  if (!response.ok || !result.success) {
    console.error(
      JSON.stringify(
        { httpStatus: response.status, responseBody: result },
        null,
        2,
      ),
    );
    return {
      isPaid: false,
      message: result.message ?? "Failed to check payment status.",
    };
  }

  const responseCode = result.data?.responseCode;
  return {
    isPaid: responseCode === 0,
    message: result.message ?? "Checked payment status",
  };
}
