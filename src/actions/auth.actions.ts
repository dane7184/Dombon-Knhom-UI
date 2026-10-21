"use server";

import {
  ChangePasswordInput,
  ForgotPasswordInput,
  ResendOtpInput,
  ResetPasswordInput,
  SignupInput,
  VerifyOtpInput,
} from "@/types/schemas/auth.schema";
import {
  ForgotPasswordData,
  LoginData,
  SessionTokenData,
  SwitchOrgData,
} from "@/types/auth.types";
import * as authService from "@/services/auth.service";
import { logout } from "@/services/auth.service";
import { ActionRes, ApiErr } from "@/types/common.type";
import { signOut } from "@/lib/auth";

async function handleError(err: unknown): Promise<ActionRes<never>> {
  if (err instanceof Response) {
    try {
      const body: ApiErr = await err.json();
      return {
        success: false,
        error: body.detail ?? "An unexpected error occurred.",
        fieldErrors: body.errors,
      };
    } catch {
      return { success: false, error: `Request failed (${err.status})` };
    }
  }
  return { success: false, error: "An unexpected error occurred." };
}

export async function signupAction(
  input: SignupInput,
): Promise<ActionRes<SessionTokenData>> {
  try {
    const json = await authService.signup(input);
    return { success: true, data: json.data };
  } catch (err) {
    return handleError(err);
  }
}

export async function verifyOtpAction(
  input: VerifyOtpInput,
): Promise<ActionRes<null>> {
  try {
    const json = await authService.verifyOtp(input);
    return { success: true, data: json.data };
  } catch (err) {
    return handleError(err);
  }
}

export async function resendOtpAction(
  input: ResendOtpInput,
): Promise<ActionRes<null>> {
  try {
    const json = await authService.resendOtp(input);
    return { success: true, data: json.data };
  } catch (err) {
    return handleError(err);
  }
}

export async function logoutAction() {
  try {
    await logout();
  } catch (err) {
    console.error("[logoutAction] Backend logout failed:", err);
  }

  await signOut({ redirectTo: "/login" });
}

export async function forgotPasswordAction(
  input: ForgotPasswordInput,
): Promise<ActionRes<ForgotPasswordData>> {
  try {
    const json = await authService.forgotPassword(input);
    return { success: true, data: json.data };
  } catch (err) {
    return handleError(err);
  }
}

export async function requestReactivationAction(
  input: ForgotPasswordInput,
): Promise<ActionRes<null>> {
  try {
    const json = await authService.requestReactivation(input);
    return { success: true, data: json.data };
  } catch (err) {
    return handleError(err);
  }
}

export async function confirmReactivationAction(
  input: Omit<ResetPasswordInput, "confirmPassword"> & {
    confirmPassword?: string;
  },
): Promise<ActionRes<LoginData>> {
  try {
    const { confirmPassword: _, ...payload } = input;
    const json = await authService.confirmReactivation(payload);
    return { success: true, data: json.data };
  } catch (err) {
    return handleError(err);
  }
}

export async function resetPasswordAction(
  input: Omit<ResetPasswordInput, "confirmPassword"> & {
    confirmPassword?: string;
  },
): Promise<ActionRes<null>> {
  try {
    const { confirmPassword: _, ...payload } = input;

    const json = await authService.resetPassword(payload);
    return { success: true, data: json.data };
  } catch (err) {
    return handleError(err);
  }
}

export async function changePasswordAction(
  input: Omit<ChangePasswordInput, "confirmPassword"> & {
    confirmPassword?: string;
  },
): Promise<ActionRes<null>> {
  try {
    const { confirmPassword: _, ...payload } = input;
    const json = await authService.changePassword(payload);
    return { success: true, data: json.data };
  } catch (err) {
    return handleError(err);
  }
}

export async function switchToOrgAction(
  orgId: string,
): Promise<ActionRes<SwitchOrgData>> {
  try {
    const json = await authService.switchToOrg(orgId);
    return { success: true, data: json.data };
  } catch (err) {
    return handleError(err);
  }
}

export async function switchToUserAction(): Promise<ActionRes<LoginData>> {
  try {
    const json = await authService.switchToUser();
    return { success: true, data: json.data };
  } catch (err) {
    return handleError(err);
  }
}
