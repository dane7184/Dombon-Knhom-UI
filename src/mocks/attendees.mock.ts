// Event attendees: GET /events/{eventId}/attendees/preview, the CSV export and
// POST /events/{eventId}/attendees/{attendeeId}/check-in. Generated from each
// event's attendeeCount so the attendee table matches the "joined" counters.
// attendeeIds are UUIDs because the QR scanner validates them with a UUID regex.

import { hasEventFlag, MOCK_EVENT_IDS, mockEvents } from "@/mocks/events.mock";
import { findMockAccount, mockAccounts } from "@/mocks/auth.mock";
import { MOCK_USER_IDS } from "@/mocks/ids";
import { mockId, nextMockId } from "@/mocks/utils";

export interface MockAttendeeRecord {
  attendeeId: string;
  eventId: string;
  userId: string;
  fullName: string;
  email: string;
  checkInAt: string | null;
  joinedAt: string;
}

const GIVEN_NAMES = ["Dalin", "Sovann", "Nary", "Phalla", "Kimheng", "Sreymom", "Veasna", "Thida", "Pheakdey", "Rotha"];
const FAMILY_NAMES = ["Chea", "Seng", "Heng", "Kong", "Lim", "Mean", "Nuon", "Ouk", "Prum", "So"];

function generate(): MockAttendeeRecord[] {
  // The logged-in mock user is only added where the fixtures say they joined.
  const community = mockAccounts.filter((a) => a.role === "User" && a.userId !== MOCK_USER_IDS.sokha);
  const sokha = findMockAccount(MOCK_USER_IDS.sokha)!;
  const result: MockAttendeeRecord[] = [];
  let n = 0;
  for (const event of mockEvents) {
    const isPast = new Date(event.endAt).getTime() < Date.now();
    const sokhaJoined = hasEventFlag("joined", sokha.userId, event.eventId);
    for (let i = 0; i < event.attendeeCount; i++) {
      n += 1;
      const account = sokhaJoined && i === 0 ? sokha : community[sokhaJoined ? i - 1 : i];
      const g = (n * 7) % GIVEN_NAMES.length;
      const f = (n * 3) % FAMILY_NAMES.length;
      const joined = new Date(event.createdAt);
      joined.setHours(joined.getHours() + 6 + i);
      result.push({
        attendeeId: mockId("a", n),
        eventId: event.eventId,
        userId: account?.userId ?? mockId("1", 0x1000 + n),
        fullName: account?.fullName ?? `${GIVEN_NAMES[g]} ${FAMILY_NAMES[f]}`,
        email: account?.email ?? `${GIVEN_NAMES[g].toLowerCase()}.${FAMILY_NAMES[f].toLowerCase()}${n}@example.com`,
        // Past events: most attendees checked in. Upcoming: nobody yet.
        checkInAt: isPast && i % 5 !== 0 ? event.startAt : null,
        joinedAt: joined.toISOString(),
      });
    }
  }
  return result;
}

/** Mutable in-memory store. */
export const mockAttendees: MockAttendeeRecord[] = generate();

/** A ticket the regular mock user holds, handy for testing the QR scanner. */
export const MOCK_SAMPLE_TICKET = {
  eventId: MOCK_EVENT_IDS.foodExpo,
  userId: MOCK_USER_IDS.sokha,
};

export function attendeesOfEvent(eventId: string): MockAttendeeRecord[] {
  return mockAttendees.filter((a) => a.eventId === eventId);
}

export function findAttendee(eventId: string, attendeeOrUserId: string): MockAttendeeRecord | undefined {
  return mockAttendees.find(
    (a) => a.eventId === eventId && (a.attendeeId === attendeeOrUserId || a.userId === attendeeOrUserId),
  );
}

/** Registers the viewer for an event (idempotent). */
export function addMockAttendee(eventId: string, userId: string): MockAttendeeRecord {
  const existing = findAttendee(eventId, userId);
  if (existing) return existing;
  const account = findMockAccount(userId);
  const record: MockAttendeeRecord = {
    attendeeId: nextMockId("a"),
    eventId,
    userId,
    fullName: account?.fullName ?? "Mock user",
    email: account?.email ?? "mock.user@example.com",
    checkInAt: null,
    joinedAt: new Date().toISOString(),
  };
  mockAttendees.push(record);
  return record;
}
