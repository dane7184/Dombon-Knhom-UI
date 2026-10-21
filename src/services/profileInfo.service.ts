// Selects the real or mock profile service. See organizer.service.ts.

import { USE_MOCK_DATA } from "@/config/data-source";
import * as api from "@/services/api/profileInfo.service";
import * as mock from "@/services/mock/profileInfo.service";

export type { CreateOrgPayload } from "@/services/api/profileInfo.service";

const service: typeof api = USE_MOCK_DATA ? mock : api;

export const {
  getProfile,
  getOrgProfile,
  getPersonalProfile,
  getPersonalOrgProfile,
  updateUserProfile,
  updateOrgProfile,
  getOwnActivities,
  getAttendedEvents,
  getCreatedEvents,
  getOrgCreatedEvents,
  getAttendedEventDetails,
  getActivities,
  getOrgActivities,
  getFavoriteUser,
  getOrgFavoriteUser,
  toggleFavoriteUser,
  toggleOrgFavoriteUser,
  getSavedEvents,
  getOrgSavedEvents,
  getSavedActivities,
  getOrgSavedActivities,
  updateAvatarClient,
  updateOrgAvatarClient,
  toggleLikeEvent,
  toggleSaveEvent,
  updatePassword,
  deleteEvent,
  getPaidEvents,
  deleteAccount,
  deleteOrgAccount,
  createOrgProfile,
  requestOrgProfile,
  uploadOrgDocument,
  patchOrgDocumentUrl,
  getAttendedEventsPage,
  getCreatedEventsPage,
  getActivitiesPage,
  getSavedEventsPage,
  getSavedActivitiesPage,
  getAvatarDisplayUrl,
} = service;
