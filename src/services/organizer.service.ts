// Picks the real API or the mock implementation once, based on
// NEXT_PUBLIC_DATA_SOURCE. Typing the choice as `typeof api` makes the compiler
// reject a mock that is missing a function or has an incompatible signature.

import { USE_MOCK_DATA } from "@/config/data-source";
import * as api from "@/services/api/organizer.service";
import * as mock from "@/services/mock/organizer.service";

const service: typeof api = USE_MOCK_DATA ? mock : api;

export const {
  getOrganizerKpi,
  getEventManagement,
  getEventManagementPage,
  getEventUpcoming,
  getTotalLikeAndAttendee,
  getTop5Event,
  organizationInfoService,
  updateOrganizationService,
  deleteAccountOrganizer,
  recentTransactionService,
  TotalEarningService,
  CurrentBalanceService,
  submitWithdrawalService,
  orgChangeAvatarService,
} = service;
