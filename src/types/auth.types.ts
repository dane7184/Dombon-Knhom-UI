import { ApiRes, Role } from "@/types/common.type";

export interface LoginData {
  token: string;
  email: string;
  userId: string;
  fullName: string;
  avatar: string | null;
  role: Role;
  province: string;
  refreshToken: string;
  orgId?: string;
}

export interface SwitchOrgData {
  token: string;
  refreshToken: string;
  orgId: string;
  orgName: string;
  logo: string;
  ownerId: string;
}

export type LoginResponse = ApiRes<LoginData>;

export type RefreshData = LoginData;
export type RefreshResponse = ApiRes<RefreshData>;

export interface MeData {
  userId: string;
  fullName: string;
  avatar: string | null;
  province: string;
  role: Role;
  orgId?: string;
  orgName?: string;
  orgLogo?: string;
}

export interface SessionTokenData {
  sessionToken: string;
}

export type ForgotPasswordData = SessionTokenData;
export type MeResponse = ApiRes<MeData>;

export type SignupResponse = ApiRes<SessionTokenData>;
export type ForgotPasswordResponse = ApiRes<SessionTokenData>;

export type ResendOtpResponse = ApiRes<null>;
export type VerifyOtpResponse = ApiRes<null>;
export type ResetPasswordResponse = ApiRes<null>;
export type ChangePasswordResponse = ApiRes<null>;
export type LogoutResponse = void;

export type ReactivationRequestResponse = ApiRes<null>;
export type ReactivateConfirmResponse = ApiRes<LoginData>;

export type SwitchOrgResponse = ApiRes<SwitchOrgData>;
export type SwitchUserResponse = ApiRes<LoginData>;
