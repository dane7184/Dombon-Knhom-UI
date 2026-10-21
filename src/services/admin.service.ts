// Selects the real or mock admin service. See organizer.service.ts.

import { USE_MOCK_DATA } from "@/config/data-source";
import * as api from "@/services/api/admin.service";
import * as mock from "@/services/mock/admin.service";

export type { DashboardStats } from "@/services/api/admin.service";

const service: typeof api = USE_MOCK_DATA ? mock : api;

export const {
  getAdminKPI,
  getCategories,
  createCategories,
  updateCategories,
  deleteCategories,
  getRecentUser,
  getAllTransactions,
  getWithdrawals,
  getWithdrawalKpi,
  updateWithdrawalStatus,
  getReports,
  getReportsServer,
  updateReportStatus,
  getReportSummary,
  getReportSummaryServer,
  getReportContent,
  getReportContentServer,
  getRelatedReports,
  getRelatedReportsServer,
  getActivityReportDetail,
  getActivityReportDetailServer,
  getActivityFullReportDetail,
  getActivityFullReportDetailServer,
  getEventReportDetail,
  getEventReportDetailServer,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  getAllOrganizers,
  getOrganizerById,
  deleteOrganizer,
  updateOrganizer,
  getAllModerators,
  createModerator,
  updateModerator,
  deleteModerator,
  getModeratorById,
} = service;
