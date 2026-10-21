// Selects the real or mock auth service. See organizer.service.ts.

import { USE_MOCK_DATA } from "@/config/data-source";
import * as api from "@/services/api/auth.service";
import * as mock from "@/services/mock/auth.service";

const service: typeof api = USE_MOCK_DATA ? mock : api;

export const {
  signup,
  verifyOtp,
  resendOtp,
  login,
  googleLogin,
  refreshToken,
  refreshSessionTokens,
  forgotPassword,
  requestReactivation,
  confirmReactivation,
  resetPassword,
  changePassword,
  getMe,
  logout,
  switchToOrg,
  switchToUser,
} = service;
