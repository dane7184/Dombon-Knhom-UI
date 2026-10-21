import {
  AppBaseCategoryType,
  AppContentType,
  AppStatus,
  Gender,
  MediaType,
  Role,
  sortOrder,
} from "./common.type";
import { ApiRes } from "./common.type";
export interface ProfileResponse {
  id: string;
  fullName: string;
  image: string;
  bio?: string | null;
  state: ProfileState;
  badges: BadgeResponse[];
  isOrganizer: boolean;
  phone: string;
  province: string;
  website: string;
  email: string;
  gender: Gender;
}
export interface ProfileState {
  favorite: number;
  posts: number;
  createdEvents: number;
}
export interface BadgeResponse {
    quantity: number;
  awardedMonths: string[];
  type: string;
}

export interface AttendedEventsTab {
  searchTerm?: string | null;
  event: AttendedEventList[];
}

export interface AttendedEventList {
  id: string;
  title: string;
  desc?: string | null;
  price?: number | null;
  location: string;
  startDate: string;
  endDate: string;
  image: string;
  isSave: boolean;
  isLike: boolean;
  category: AppBaseCategoryType;
}

export interface CreatedEventsTab {
  searchTerm?: string | null;
  activeStatus: AppStatus;
  events: CreatedEventList[];
}

export interface CreatedEventsTab {
  searchTerm?: string | null;
  events: CreatedEventList[];
}
export interface CreatedEventList {
  id: string;
  title: string;
  desc?: string | null;
  price?: number | null;
  location: string;
  startDate: string;
  endDate: string;
  image: string;
  isLike: boolean;
  category: AppBaseCategoryType;
}

export interface FavoriteTab {
  searchTerm?: string | null;
  sortBy: sortOrder;
  favorites: FavoriteUserlist[];
}

export interface FavoriteUserlist {
  entityId: string;
  image: string;
  name: string;
  username?: string;
  email?: string;
  favoriteCount: number;
  entity: Role;
  createdAt: string;
  bookmarkId: string;
  entityType: Role;
}

export type ShowCardsOption = SavedEventList | ActivitiesList;
export interface SavedTab {
  searchTerm?: string | null;
  saveSection: AppContentType;
  showCards: ShowCardsOption[];
}

export interface SavedEventList {
  id: string;
  title: string;
  desc?: string | null;
  price?: number | null;
  location: string;
  startDate: string;
  endDate: string;
  image: string;
  isSave: boolean;
  isLike: boolean;
  category: AppBaseCategoryType;
}

export interface ActivitiesList {
  id: string;
  media: MediaType;
  mediaUrl: string;
  duration?: string | null;
  isMultiple: boolean;
}

// Profile Info
export interface InfoTabResponse {
  personalInfo: UserPersonalDetail;
}

export interface UserPersonalDetail {
  fullName: string;
  email: string;
  gender: Gender;
  bio: string;
  isOrganizer: boolean;
  phone: string;
  province: string;
  website: string;
}
export interface UpdateProfileRequest {
  fullName?: string | null;
  gender?: Gender | null;
  bio?: string | null;
  phone?: string | null;
  province?: string | null;
  website?: string | null;
}
export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface OrganizerRequest {
  image: string;
  fullName: string;
  province: string;
  phone: string;
  website: string;
  bio: string | null;
  verificationDocument: string;
}

export interface AccountSettingRequest {
  id: string;
  isOrganizer: boolean;
  orgId?: string | null;
  hasOrg?: boolean;
}

export interface AuthResponse {
  token: string;
  email: string;
  userId: string;
  role: Role;
  province: string;
}

export interface RecentUserType {
  userNo: string;
  fullName: string;
  gender: Gender;
  gmail: string;
  role: Role;
}

export interface CategoryListType {
  categoryName: string;
  color: string;
}

// matches API response shape exactly
export interface BaseProfileInfo {
  userId: string;
  fullName: string;
  avatar: string | null;
  bio?: string | null;
  gender?: Gender;
  eventCount?: number;
  activityCount?: number;
  favoriteCount?: number | null;
  badge: BadgeResponse[];
  isFavorite: boolean;
  isOrganizer?: boolean;
  role?: Role;
  orgId?: string | null;
  createdEventCount?: number;
  phone?: string | null;
  province?: string | null;
  website?: string | null;
  email?: string;
  hasOrg?: boolean;
}
export type ProfileInfoResponse = ApiRes<ProfileInfoType>;


export interface OrganizerProfile extends BaseProfileInfo {
  logo?: string | null;
  name: string;
  about: string;
  orgId: string; 
  province: string;
  phone: string;
  website: string;
}

export type ProfileInfoType = BaseProfileInfo | OrganizerProfile;

export function isOrganizerProfile(
  profile: ProfileInfoType,
): profile is OrganizerProfile {
  return (
    profile.isOrganizer === true ||
    profile.role === "Organizer" ||
    ("province" in profile && "phone" in profile && "website" in profile)
  );
}

export interface SearchUser {
  id: string | number;
  fullName: string;
  image?: string;
  role: string;
  isOrganizer: boolean;
  bio?: string;
  isCurrentUser?: boolean;
  badges?: { name: string }[];
}
