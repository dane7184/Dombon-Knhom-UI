// Organization creation requests reviewed by moderators
// (GET /moderator/organizers, /moderator/organizers/{orgId}) and listed for
// admins (GET /admin/organizers). The three shared mock organizations appear
// as approved requests; pending ones reuse src/data/mock-organizers.ts rows.

import type { AppStatus } from "@/types/common.type";
import { mockOrgRequests as legacyRequests } from "@/data/mock-organizers";
import { findMockAccount, findMockOrganization } from "@/mocks/auth.mock";
import { mockOrganizations } from "@/mocks/organizer.mock";
import { mockId } from "@/mocks/utils";

export interface MockOrgRequestRecord {
  orgId: string;
  orgName: string;
  phone: string;
  requestBy: string;
  email: string;
  province: string;
  website: string;
  about: string;
  logo: string | null;
  status: AppStatus;
  rejectedReason: string | null;
  submitted: string;
}

const PROVINCES = ["Phnom_Penh", "Siem_Reap", "Battambang", "Kampot", "Kandal", "Takeo"];

const approved: MockOrgRequestRecord[] = mockOrganizations.map((org) => {
  const owner = findMockAccount(findMockOrganization(org.orgId)?.ownerId);
  return {
    orgId: org.orgId,
    orgName: org.name,
    phone: org.phone,
    requestBy: owner?.fullName ?? "",
    email: owner?.email ?? "",
    province: org.province,
    website: org.website,
    about: org.about,
    logo: org.logo,
    status: "Approved",
    rejectedReason: null,
    submitted: org.createdAt,
  };
});

const pending: MockOrgRequestRecord[] = legacyRequests.map((r, i) => {
  const date = new Date(r.createdAt);
  // The last two legacy rows are marked rejected so every status filter has data.
  const status: AppStatus = i >= legacyRequests.length - 2 ? "Rejected" : r.status;
  return {
    orgId: mockId("2", 0x10 + i),
    orgName: r.orgName,
    phone: r.phone,
    requestBy: r.requestBy,
    email: `${r.requestBy.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
    province: PROVINCES[i % PROVINCES.length],
    website: "",
    about: `${r.orgName} organizes community events and would like to publish them on Dombon Khnom.`,
    logo: null,
    status,
    rejectedReason: status === "Rejected" ? "Supporting document was missing or unreadable." : null,
    submitted: Number.isNaN(date.getTime()) ? r.createdAt : date.toISOString(),
  };
});

/** Mutable in-memory store. */
export const mockOrgRequests: MockOrgRequestRecord[] = [...approved, ...pending];

export function findMockOrgRequest(orgId: string): MockOrgRequestRecord | undefined {
  return mockOrgRequests.find((r) => r.orgId === orgId);
}
