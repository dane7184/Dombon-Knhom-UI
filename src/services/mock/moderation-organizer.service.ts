// Mock implementation of services/api/moderation-organizer.service.ts.
// Tokens are omitted (unused); status changes are in-memory only.

import type { ModOrgCreationResponse, OrgRequestDetailResponse } from "@/types/moderator.type";
import { findMockOrgRequest, mockOrgRequests } from "@/mocks/org-requests.mock";
import { logMockWrite, mockRequest } from "@/mocks/utils";

export async function getOrganizerRequests(): Promise<ModOrgCreationResponse[]> {
  await mockRequest("moderator.orgRequests");
  return mockOrgRequests.map((r) => ({
    orgId: r.orgId,
    orgName: r.orgName,
    phone: r.phone,
    requestBy: r.requestBy,
    createdAt: r.submitted,
    status: r.status,
  }));
}

export async function getOrgRequestDetail(orgId: string): Promise<OrgRequestDetailResponse | null> {
  await mockRequest("moderator.orgRequestDetail");
  const r = findMockOrgRequest(orgId);
  if (!r) return null;
  return {
    status: r.status,
    name: r.orgName,
    requested: r.submitted,
    logo: r.logo ?? undefined,
    province: r.province,
    phone: r.phone,
    website: r.website,
    submittedBy: r.requestBy,
    about: r.about,
    // No supporting-document file exists in the project, so none is returned.
    documentUrl: undefined,
  };
}

export async function patchOrganizerStatus(
  orgId: string,
  status: "Approved" | "Rejected",
  reason?: string,
): Promise<boolean> {
  await mockRequest("moderator.orgRequestStatus");
  const r = findMockOrgRequest(orgId);
  if (!r) return false;
  r.status = status;
  r.rejectedReason = status === "Rejected" ? (reason ?? null) : null;
  logMockWrite("patchOrganizerStatus", { orgId, status });
  return true;
}
