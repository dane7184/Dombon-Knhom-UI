// Selects the real or mock activity service. See organizer.service.ts.

import { USE_MOCK_DATA } from "@/config/data-source";
import * as api from "@/services/api/activity.service";
import * as mock from "@/services/mock/activity.service";

export type { FeedPage, MappedPostDetail } from "@/services/api/activity.service";

const service: typeof api = USE_MOCK_DATA ? mock : api;

export const {
  getActivityComments,
  loadMoreActivityComments,
  getActivityCommentReplies,
  postActivityCommentService,
  postActivityReplyService,
  editActivityCommentService,
  deleteActivityCommentService,
  fetchMyAttendedEvents,
  getActivityDetail,
  createActivityServer,
  updateActivityServer,
  deleteActivityServer,
  createActivity,
  updateActivity,
  deleteActivity,
  reportActivity,
  removeMediaFromActivity,
  uploadActivityImages,
  uploadActivityVideo,
  mapRawActivityToFeedActivity,
  fetchActivityFeed,
  mapRawGalleryItems,
  getGallery,
  getGalleryPage,
  toggleActivityReactionWithCookie,
  toggleLikeActivity,
  toggleSavedActivity,
  mapActivityDetailToPostDetail,
} = service;
