// Mock implementation of services/api/searchName.service.ts.
// Searches the mock accounts and organizations by name.

import type { ApiSearchUser } from "@/services/api/searchName.service";
import type { SearchUser } from "@/types/user.type";
import { mockAccounts, mockOrganizationIdentities } from "@/mocks/auth.mock";
import { mockRequest } from "@/mocks/utils";

/** GET /users result items: users (moderators/admins excluded) and organizations. */
function directory(): ApiSearchUser[] {
  const users: ApiSearchUser[] = mockAccounts
    .filter((a) => a.role === "User" || a.role === "Organizer")
    .map((a) => ({
      id: a.userId,
      name: a.fullName,
      image: a.avatar,
      role: a.role,
      isOrg: false,
      createdAt: a.createdAt,
    }));
  const orgs: ApiSearchUser[] = mockOrganizationIdentities.map((o) => ({
    id: o.orgId,
    name: o.name,
    image: o.logo,
    role: "Organizer",
    isOrg: true,
    createdAt: "2025-09-01T09:00:00.000Z",
  }));
  return [...users, ...orgs];
}

function search(name: string, size: number): ApiSearchUser[] {
  const term = name.trim().toLowerCase();
  return directory()
    .filter((u) => !term || u.name.toLowerCase().includes(term))
    .slice(0, size);
}

export async function getMeByName(_userToken: string, name: string, size: number = 10): Promise<SearchUser[]> {
  await mockRequest("search.users");
  return search(name, size).map((u) => ({
    id: u.id,
    fullName: u.name,
    image: u.image ?? undefined,
    role: u.role,
    isOrganizer: u.isOrg,
  }));
}

export async function searchUsersService(name: string, size: number = 10): Promise<ApiSearchUser[]> {
  await mockRequest("search.users");
  return search(name, size);
}
