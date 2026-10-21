// Mock implementation of services/api/auth.service.ts.
//
// Login accounts mirror the README test accounts (password for all:
// MOCK_PASSWORD = "Koko@1234"):
//   dane003@gmail.com   User
//   dane004@gmail.com   Organizer (owns "Angkor Events Collective")
//   dane002@gmail.com   Moderator
//   dane001@gmail.com   Admin
// Signup / OTP / password changes are kept in server memory only and are lost
// when the dev server restarts. Any 6-digit OTP works except "000000".

import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  SignupInput,
  VerifyOtpInput,
} from "@/types/schemas/auth.schema";
import type {
  ChangePasswordResponse,
  ForgotPasswordResponse,
  LoginData,
  LoginResponse,
  MeResponse,
  ReactivateConfirmResponse,
  ReactivationRequestResponse,
  RefreshResponse,
  ResendOtpResponse,
  ResetPasswordResponse,
  SignupResponse,
  SwitchOrgResponse,
  SwitchUserResponse,
  VerifyOtpResponse,
} from "@/types/auth.types";
import {
  createMockToken,
  findMockAccount,
  findMockAccountByEmail,
  MOCK_INVALID_OTP,
  MOCK_PASSWORD,
  mockAccounts,
  readMockToken,
  type MockAccount,
} from "@/mocks/auth.mock";
import { MOCK_AVATARS } from "@/mocks/assets";
import { MOCK_USER_IDS } from "@/mocks/ids";
import { findMockOrganizationProfile } from "@/mocks/organizer.mock";
import { getMockViewer } from "@/mocks/session";
import { apiErrorResponse, apiRes, logMockWrite, mockRequest, nextMockId } from "@/mocks/utils";

// ── In-memory auth state ─────────────────────────────────────

const passwords = new Map<string, string>();

function passwordOf(account: MockAccount): string {
  return passwords.get(account.userId) ?? MOCK_PASSWORD;
}

interface PendingSignup {
  fullName: string;
  email: string;
  password: string;
  gender: SignupInput["gender"];
}

const pendingSignups = new Map<string, PendingSignup>();
/** sessionToken → email, issued by forgot-password / reactivation requests. */
const passwordResetSessions = new Map<string, string>();

function newSessionToken(): string {
  return crypto.randomUUID();
}

function toLoginData(account: MockAccount, orgId?: string | null): LoginData {
  return {
    token: createMockToken({ sub: account.userId, orgId: orgId ?? null, type: "access" }),
    refreshToken: createMockToken({ sub: account.userId, orgId: orgId ?? null, type: "refresh" }),
    email: account.email,
    userId: account.userId,
    fullName: account.fullName,
    avatar: account.avatar,
    role: account.role,
    province: account.province,
  };
}

async function requireViewerAccount(): Promise<MockAccount> {
  const viewer = await getMockViewer();
  const account = findMockAccount(viewer?.userId);
  if (!account) throw apiErrorResponse(401, "You are not signed in.");
  return account;
}

// ── Signup & OTP ─────────────────────────────────────────────

export async function signup(input: SignupInput): Promise<SignupResponse> {
  await mockRequest("auth.signup");
  if (findMockAccountByEmail(input.email)) {
    throw apiErrorResponse(409, "An account with this email already exists.", {
      email: "Email is already registered",
    });
  }
  const sessionToken = newSessionToken();
  pendingSignups.set(sessionToken, { ...input });
  return apiRes({ sessionToken }, "OTP sent to your email (mock: any 6 digits except 000000)");
}

export async function verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpResponse> {
  await mockRequest("auth.verifyOtp");
  if (input.otp === MOCK_INVALID_OTP) {
    throw apiErrorResponse(400, "Invalid or expired OTP.", { otp: "Invalid OTP" });
  }

  const pending = pendingSignups.get(input.sessionToken);
  if (pending) {
    pendingSignups.delete(input.sessionToken);
    const account: MockAccount = {
      userId: nextMockId("1"),
      fullName: pending.fullName,
      email: pending.email,
      avatar: null,
      role: "User",
      province: "Phnom_Penh",
      gender: pending.gender,
      bio: "",
      createdAt: new Date().toISOString(),
      orgId: null,
      canLogin: true,
    };
    mockAccounts.push(account);
    passwords.set(account.userId, pending.password);
    logMockWrite("signup verified — account created", { email: account.email });
  }
  // Password-reset sessions also go through OTP; nothing else to do for them.
  return apiRes(null, "OTP verified");
}

export async function resendOtp(): Promise<ResendOtpResponse> {
  await mockRequest("auth.resendOtp");
  return apiRes(null, "OTP resent (mock: no email is sent)");
}

// ── Login / tokens ───────────────────────────────────────────

export async function login(input: LoginInput): Promise<LoginResponse> {
  await mockRequest("auth.login");
  const account = findMockAccountByEmail(input.email);
  if (!account || !account.canLogin || passwordOf(account) !== input.password) {
    throw apiErrorResponse(401, "Invalid email or password.");
  }
  return apiRes(toLoginData(account), "Login successful");
}

/** Google sign-in still needs real Google OAuth; the backend exchange is mocked to the demo user. */
export async function googleLogin(): Promise<LoginResponse> {
  await mockRequest("auth.google");
  const account = findMockAccount(MOCK_USER_IDS.sokha)!;
  return apiRes(toLoginData(account), "Login successful");
}

export async function refreshToken(): Promise<RefreshResponse> {
  await mockRequest("auth.refresh", 0);
  const viewer = await getMockViewer();
  const account = findMockAccount(viewer?.userId);
  if (!account) throw apiErrorResponse(401, "Refresh token expired.");
  return apiRes(toLoginData(account, viewer?.orgId), null);
}

export async function refreshSessionTokens(
  currentRefreshToken: string,
): Promise<{ token: string; refreshToken: string } | null> {
  const claims = readMockToken(currentRefreshToken);
  if (!claims?.sub || !findMockAccount(claims.sub)) return null;
  return {
    token: createMockToken({ sub: claims.sub, orgId: claims.orgId ?? null, type: "access" }),
    refreshToken: createMockToken({ sub: claims.sub, orgId: claims.orgId ?? null, type: "refresh" }),
  };
}

// ── Password recovery & reactivation ─────────────────────────

export async function forgotPassword(input: ForgotPasswordInput): Promise<ForgotPasswordResponse> {
  await mockRequest("auth.forgotPassword");
  const sessionToken = newSessionToken();
  // Like most backends, don't reveal whether the email exists.
  if (findMockAccountByEmail(input.email)) passwordResetSessions.set(sessionToken, input.email);
  return apiRes({ sessionToken }, "OTP sent to your email (mock: no email is sent)");
}

export async function requestReactivation(input: ForgotPasswordInput): Promise<ReactivationRequestResponse> {
  await mockRequest("auth.reactivationRequest");
  if (!findMockAccountByEmail(input.email)) {
    throw apiErrorResponse(404, "No account found for this email.");
  }
  return apiRes(null, "Reactivation email sent (mock: no email is sent)");
}

export async function confirmReactivation(
  input: Pick<ResetPasswordInput, "sessionToken" | "newPassword">,
): Promise<ReactivateConfirmResponse> {
  await mockRequest("auth.reactivationConfirm");
  const email = passwordResetSessions.get(input.sessionToken);
  const account = email ? findMockAccountByEmail(email) : undefined;
  if (!account) throw apiErrorResponse(400, "Reactivation session is invalid or expired.");
  passwords.set(account.userId, input.newPassword);
  passwordResetSessions.delete(input.sessionToken);
  logMockWrite("account reactivated", { email });
  return apiRes(toLoginData(account), "Account reactivated");
}

export async function resetPassword(
  input: Pick<ResetPasswordInput, "sessionToken" | "newPassword">,
): Promise<ResetPasswordResponse> {
  await mockRequest("auth.resetPassword");
  const email = passwordResetSessions.get(input.sessionToken);
  const account = email ? findMockAccountByEmail(email) : undefined;
  if (!account) throw apiErrorResponse(400, "Reset session is invalid or expired.");
  passwords.set(account.userId, input.newPassword);
  passwordResetSessions.delete(input.sessionToken);
  logMockWrite("password reset", { email });
  return apiRes(null, "Password reset successfully");
}

export async function changePassword(
  input: Pick<ChangePasswordInput, "currentPassword" | "newPassword">,
): Promise<ChangePasswordResponse> {
  await mockRequest("auth.changePassword");
  const account = await requireViewerAccount();
  if (passwordOf(account) !== input.currentPassword) {
    throw apiErrorResponse(400, "Current password is incorrect.", {
      currentPassword: "Current password is incorrect",
    });
  }
  passwords.set(account.userId, input.newPassword);
  logMockWrite("password changed", { userId: account.userId });
  return apiRes(null, "Password changed successfully");
}

// ── Current user & mode switching ────────────────────────────

export async function getMe(): Promise<MeResponse> {
  await mockRequest("auth.me", 0);
  const viewer = await getMockViewer();
  const account = findMockAccount(viewer?.userId);
  if (!account) throw new Error("API Error 401: not signed in (mock)");
  const org = findMockOrganizationProfile(account.orgId);
  return apiRes({
    userId: account.userId,
    fullName: account.fullName,
    avatar: account.avatar,
    province: account.province,
    role: account.role,
    ...(org ? { orgId: org.orgId, orgName: org.name, orgLogo: org.logo } : {}),
  });
}

export async function logout(): Promise<void> {
  await mockRequest("auth.logout", 0);
}

export async function switchToOrg(orgId: string): Promise<SwitchOrgResponse> {
  await mockRequest("auth.switchToOrg");
  const viewer = await getMockViewer();
  const account = findMockAccount(viewer?.userId);
  const org = findMockOrganizationProfile(orgId);
  if (!account || !org || account.orgId !== orgId) {
    throw new Error(`API Error 403: you are not a member of organization ${orgId} (mock)`);
  }
  return apiRes(
    {
      token: createMockToken({ sub: account.userId, orgId, type: "access" }),
      refreshToken: createMockToken({ sub: account.userId, orgId, type: "refresh" }),
      orgId: org.orgId,
      orgName: org.name,
      logo: org.logo ?? MOCK_AVATARS.organization,
      ownerId: account.userId,
    },
    "Switched to organization",
  );
}

export async function switchToUser(): Promise<SwitchUserResponse> {
  await mockRequest("auth.switchToUser");
  const viewer = await getMockViewer();
  const account = findMockAccount(viewer?.userId);
  if (!account) throw new Error("API Error 401: not signed in (mock)");
  return apiRes(toLoginData(account), "Switched to user");
}
