"use server";

import { auth } from "@/lib/auth";
import {
  getPaymentQrImageService,
  checkPaymentStatusService,
} from "@/services/payment.service";

type ActionResultWithData<T> =
  | { success: true; data: T; message: string }
  | { error: string; message: string };

/**
 * Generates a scannable QR image (base64 data URL) from a Bakong QR string + md5.
 * Used initially after joining a paid event, and again on "Regenerate QR".
 */
export async function getPaymentQrAction(
  qr: string,
  md5: string,
): Promise<ActionResultWithData<string>> {
  const session = await auth();
  if (!session?.user)
    return { error: "Unauthorized", message: "Please log in." };

  const { data, message } = await getPaymentQrImageService(qr, md5);
  if (!data) return { error: "Failed", message };

  return { success: true, data, message };
}

/**
 * Checks whether the payment for the given md5 has succeeded.
 * Poll this every 3s while the QR modal is open.
 */
export async function checkPaymentStatusAction(
  md5: string,
): Promise<ActionResultWithData<boolean>> {
  const session = await auth();
  if (!session?.user)
    return { error: "Unauthorized", message: "Please log in." };

  const { isPaid, message } = await checkPaymentStatusService(md5);
  return { success: true, data: isPaid, message };
}
