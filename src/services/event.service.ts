// Selects the real or mock event service. See organizer.service.ts.

import { USE_MOCK_DATA } from "@/config/data-source";
import * as api from "@/services/api/event.service";
import * as mock from "@/services/mock/event.service";

export type {
  CheckInResponse,
  CreateEventAgendaItem,
  CreateEventRequest,
  DateRangeFilter,
  EventListResult,
  EventParams,
  PolygonFilter,
} from "@/services/api/event.service";

const service: typeof api = USE_MOCK_DATA ? mock : api;

export const {
  formatDateString,
  filterByPolygon,
  getAllEvents,
  getEventList,
  getEventDetail,
  getEventAttendeesPreview,
  getEventComments,
  getCommentReplies,
  getEventRatings,
  getOrgProfile,
  getUserProfile,
  toggleLikeService,
  toggleSaveService,
  reportEventService,
  rateEventService,
  joinEventService,
  postCommentService,
  postReplyService,
  editCommentService,
  deleteCommentService,
  toggleFavoriteOrgService,
  toggleFavoriteUserService,
  createEventService,
  updateEventService,
  deleteEventService,
  createEvent,
  updateEvent,
  uploadEventCover,
  fetchEventDetails,
  fetchOrganizationEvents,
  deleteEvent,
  fetchUpcomingEvents,
  exportEventAttendees,
  checkInAttendee,
} = service;
