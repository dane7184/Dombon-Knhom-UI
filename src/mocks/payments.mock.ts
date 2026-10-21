// Deterministic mock of the Bakong KHQR payment flow for paid events:
//   1. POST /events/{id}/join on a paid event → requiresPayment + a mock QR
//      string and md5 (createPendingPayment).
//   2. POST /payment/qr/image → the local placeholder /images/qr.png
//      (it is NOT a scannable KHQR code).
//   3. POST /payment/transactions/check → unpaid on the 1st poll, paid from
//      the 2nd poll on; the viewer is then registered as an attendee.
// State is in-memory only and resets when the server restarts.

export const MOCK_PAYMENT_QR_IMAGE = "/images/qr.png";
export const MOCK_PAYMENT_CURRENCY = "USD";

/** Number of status checks before a payment is reported as paid. */
export const MOCK_PAYMENT_CONFIRM_AFTER_POLLS = 2;

export interface MockPendingPayment {
  md5: string;
  qrString: string;
  eventId: string;
  userId: string;
  amount: number;
  polls: number;
  paid: boolean;
}

export const mockPendingPayments = new Map<string, MockPendingPayment>();

let paymentCounter = 0;

export function createPendingPayment(eventId: string, userId: string, amount: number): MockPendingPayment {
  paymentCounter += 1;
  const md5 = `mock${paymentCounter.toString(16).padStart(4, "0")}${eventId.replace(/-/g, "").slice(-12)}${Date.now().toString(16)}`;
  const payment: MockPendingPayment = {
    md5,
    qrString: `MOCK-KHQR|event=${eventId}|amount=${amount.toFixed(2)}|currency=${MOCK_PAYMENT_CURRENCY}`,
    eventId,
    userId,
    amount,
    polls: 0,
    paid: false,
  };
  mockPendingPayments.set(md5, payment);
  return payment;
}
