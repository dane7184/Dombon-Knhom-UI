import {
  ChangePasswordInput,
  ForgotPasswordInput,
  GoogleOAuthInput,
  LoginInput,
  ResendOtpInput,
  ResetPasswordInput,
  SignupInput,
  VerifyOtpInput,
} from "@/types/schemas/auth.schema";
import {
  ChangePasswordResponse,
  ForgotPasswordResponse,
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
import { serverFetch } from "@/lib/server-fetch";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function signup(input: SignupInput): Promise<SignupResponse> {
  const res = await serverFetch("auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw res;
  return await res.json();
}

export async function verifyOtp(
  input: VerifyOtpInput,
): Promise<VerifyOtpResponse> {
  const res = await serverFetch("auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw res;
  return await res.json();
}

export async function resendOtp(
  input: ResendOtpInput,
): Promise<ResendOtpResponse> {
  const res = await serverFetch("auth/resend-otp", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw res;
  return await res.json();
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const res = await serverFetch("auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!res.ok) throw res;
  return await res.json();
}

export async function googleLogin(
  input: GoogleOAuthInput,
): Promise<LoginResponse> {

  const res = await serverFetch("auth/login/google", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw res;
  return await res.json();
}

export async function refreshToken(): Promise<RefreshResponse> {
  const res = await fetch(`${BASE}auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw res;
  return await res.json();
}

/**
 * Server-side refresh used by the next-auth jwt callback (lib/auth.ts).
 * Sends the refresh token as the backend's refresh_token cookie.
 * Returns null when the backend rejects the refresh.
 */
export async function refreshSessionTokens(
  currentRefreshToken: string,
): Promise<{ token: string; refreshToken: string } | null> {
  const res = await fetch(`${BASE}auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `refresh_token=${currentRefreshToken}`,
    },
  });

  if (!res.ok) return null;

  const json = await res.json();
  return { token: json.data.token, refreshToken: json.data.refreshToken };
}

export async function forgotPassword(
  input: ForgotPasswordInput,
): Promise<ForgotPasswordResponse> {
  const res = await serverFetch("auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw res;
  return await res.json();
}

export async function requestReactivation(
  input: ForgotPasswordInput,
): Promise<ReactivationRequestResponse> {
  const res = await serverFetch("auth/reactivate/request", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw res;
  return await res.json();
}

export async function confirmReactivation(
  input: Pick<ResetPasswordInput, "sessionToken" | "newPassword">,
): Promise<ReactivateConfirmResponse> {
  const res = await serverFetch("auth/reactivate/confirm", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw res;
  return await res.json();
}

export async function resetPassword(
  input: Pick<ResetPasswordInput, "sessionToken" | "newPassword">,
): Promise<ResetPasswordResponse> {
  const res = await serverFetch("auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw res;
  return await res.json();
}

export async function changePassword(
  input: Pick<ChangePasswordInput, "currentPassword" | "newPassword">,
): Promise<ChangePasswordResponse> {
  const res = await serverFetch("auth/change-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw res;
  return await res.json();
}

export async function getMe(): Promise<MeResponse> {
  const res = await serverFetch("users/me");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return await res.json();
}

export async function logout(): Promise<void> {
  const res = await serverFetch("auth/logout", { method: "POST" });
  if (res.status !== 204 && !res.ok) throw res;
}

export async function switchToOrg(orgId: string): Promise<SwitchOrgResponse> {
  const res = await serverFetch(`users/switch-to-org/${orgId}`, {
    method: "POST",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function switchToUser(): Promise<SwitchUserResponse> {
  const res = await serverFetch(`users/switch-to-user`, {
    method: "POST",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return res.json();
}
