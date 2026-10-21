// Mock implementation of services/api/payment.service.ts.
// Flow and placeholders are documented in src/mocks/payments.mock.ts.

import { addMockAttendee } from "@/mocks/attendees.mock";
import { findMockEvent, hasEventFlag, toggleEventFlag } from "@/mocks/events.mock";
import {
  MOCK_PAYMENT_CONFIRM_AFTER_POLLS,
  MOCK_PAYMENT_QR_IMAGE,
  mockPendingPayments,
} from "@/mocks/payments.mock";
import { logMockWrite, mockRequest } from "@/mocks/utils";

export async function getPaymentQrImageService(
  qr: string,
  md5: string,
): Promise<{ data: string | null; message: string }> {
  await mockRequest("payment.qr");
  const payment = mockPendingPayments.get(md5);
  if (!payment || payment.qrString !== qr) {
    return { data: null, message: "Failed to generate QR image." };
  }
  // Local placeholder image — not a scannable KHQR code.
  return { data: MOCK_PAYMENT_QR_IMAGE, message: "QR generated (mock placeholder)" };
}

export async function checkPaymentStatusService(
  md5: string,
): Promise<{ isPaid: boolean; message: string }> {
  await mockRequest("payment.check");
  const payment = mockPendingPayments.get(md5);
  if (!payment) return { isPaid: false, message: "Failed to check payment status." };

  payment.polls += 1;
  if (!payment.paid && payment.polls >= MOCK_PAYMENT_CONFIRM_AFTER_POLLS) {
    payment.paid = true;
    addMockAttendee(payment.eventId, payment.userId);
    if (!hasEventFlag("joined", payment.userId, payment.eventId)) {
      toggleEventFlag("joined", payment.userId, payment.eventId);
      const event = findMockEvent(payment.eventId);
      if (event) event.attendeeCount += 1;
    }
    logMockWrite("payment confirmed (mock)", { md5, eventId: payment.eventId });
  }

  return {
    isPaid: payment.paid,
    message: payment.paid ? "Payment successful" : "Waiting for payment",
  };
}
