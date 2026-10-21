// Well-known ids shared by every mock fixture, so cross references
// (event → organization, activity → event, comment → user) stay consistent.
//
// Prefix convention (first hex digit):
//   1 users · 2 organizations · 3 events · 4 activities · 5 media
//   6 comments/ratings · 7 transactions · 8 categories · 9 tags
//   a attendees · b reports · c notifications · d withdrawals/admin records

import { mockId } from "@/mocks/utils";

export const MOCK_USER_IDS = {
  sokha: mockId("1", 1), // regular user (login account)
  dara: mockId("1", 2), // organizer who owns ORG angkor (login account)
  moderator: mockId("1", 3), // moderator (login account)
  admin: mockId("1", 4), // system admin (login account)
  vanna: mockId("1", 5),
  sreypov: mockId("1", 6),
  rithy: mockId("1", 7),
  chenda: mockId("1", 8),
  pisey: mockId("1", 9),
  bora: mockId("1", 10),
} as const;

export const MOCK_ORG_IDS = {
  angkor: mockId("2", 1), // owned by Dara
  mekong: mockId("2", 2), // owned by Vanna
  techHub: mockId("2", 3), // owned by Rithy
} as const;
