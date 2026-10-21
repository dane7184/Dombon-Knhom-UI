import { ApiRes, CursorData } from "@/types/common.type";
import { AttendedEvent, CreatedEvent, EventProfileRespone, SavedEvent, WalletEventList } from "@/types/event.type";
import {  BaseProfileInfo, FavoriteUserlist, ProfileInfoType } from "@/types/user.type";
import { serverFetch } from "@/lib/server-fetch";
import { clientFetch } from "@/lib/client-fetch";
import {ActivitiesResponse} from "@/types/activity.type";
import {PersonalInfoFormValues} from "@/types/schemas/profile.schema";

export async function getProfile(userId: string): Promise<ApiRes<ProfileInfoType>> {
  const res = await serverFetch(`users/${userId}/profile`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return await res.json(); 
}

// get orgnizer profile
export async function getOrgProfile(orgId: string): Promise<ApiRes<ProfileInfoType>> {
  const res = await serverFetch(`organizations/${orgId}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  const json = await res.json();
  const org = json.data;

  // Normalize org response → ProfileInfoType shape
  const normalized: ProfileInfoType = {
    userId: org.orgId,
    fullName: org.name,
    avatar: org.logo ?? null,
    bio: org.about ?? null,
    phone: org.phone ?? null,
    website: org.website ?? null,
    province: org.province ?? null,
    favoriteCount: org.favoriteCount ?? 0,
    activityCount: org.activityCount ?? 0,
    createdEventCount: org.eventCount ?? 0,
    badge: org.badge ?? [],
    isOrganizer: true,
    isFavorite: org.isFavorite ?? false,
  };

  return {
    ...json,
    data: normalized,
  };
}

// for update profile (current user, client-side)
export async function getPersonalProfile(userId: string): Promise<BaseProfileInfo> {
  const res = await clientFetch(`users/${userId}/profile`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  const json = await res.json();
  return json.data;
}

// for update profile (current organizer, client-side)
export async function getPersonalOrgProfile(orgId: string): Promise<{
  fullName: string;
  bio: string;
  phone: string;
  website: string;
}> {
  const res = await clientFetch(`organizations/${orgId}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  const json = await res.json();
  const org = json.data;

  return {
    fullName: org.name ?? "",
    bio: org.about ?? "",
    phone: org.phone ?? "",
    website: org.website ?? "",
  };
}

// Update profile (User)
export async function updateUserProfile(form: PersonalInfoFormValues): Promise<ApiRes<BaseProfileInfo>> {
  const res = await clientFetch(`users`, {
    method: "PATCH",
    body: JSON.stringify({
      fullName: form.fullName,
      gender: form.gender,
      bio: form.bio ?? "",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  return await res.json();
}

// Update profile (Organizer)
export async function updateOrgProfile(orgId: string, form: PersonalInfoFormValues): Promise<void> {
  const res = await clientFetch(`organizations/${orgId}`, {
    method: "PUT",
    body: JSON.stringify({
      name: form.fullName,
      about: form.bio ?? "",
      phone: form.phone,
      website: form.website || undefined,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
}


// // get Organizer Profile
// export async function getOrganizerProfile(orgId: string): Promise<ProfileInfoType> {
//   const res = await serverFetch(`organizations/${orgId}`);
//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(`API Error ${res.status}: ${text}`);
//   }
//   return await res.json();
// }

// Get own activities
export async function getOwnActivities(
  userId: string,
): Promise<ActivitiesResponse[]> {
  const res = await serverFetch(`users/${userId}/activities`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return await res.json();
}

//Get attended events
export async function getAttendedEvents(
  userId: string,
): Promise<ApiRes<CursorData<EventProfileRespone>>> {
  const res = await serverFetch(`users/${userId}/events/attended`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return await res.json();
}

// Get created events
export async function getCreatedEvents(
  userId: string,
  status?: string,
): Promise<ApiRes<CursorData<CreatedEvent>>> {
  const query = status ? `?status=${status}` : "";
  const res = await serverFetch(`users/${userId}/events/created${query}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return await res.json();
}

// Get Org Created events
export async function getOrgCreatedEvents(
  orgId: string
): Promise<ApiRes<CursorData<CreatedEvent>>> {
  const res = await serverFetch(`organizations/${orgId}/events`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return await res.json();
}


// Get Attended Event
export async function getAttendedEventDetails(
  userId: string,
): Promise<ApiRes<CursorData<AttendedEvent>>> {
  const res = await serverFetch(`users/${userId}/events/attended`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return await res.json();
}

// Get Acctivities
export async function getActivities(
  userId: string,
): Promise<ApiRes<CursorData<ActivitiesResponse>>> {
  const res = await serverFetch(`users/${userId}/activities`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return await res.json();
}

export async function getOrgActivities(
  orgId: string,
): Promise<ApiRes<CursorData<ActivitiesResponse>>> {
  const res = await serverFetch(`organizations/${orgId}/activities`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return await res.json();
}

// Get Favorite
export async function getFavoriteUser(
  userId: string,
): Promise<ApiRes<CursorData<FavoriteUserlist>>> {
  const res = await serverFetch(`users/${userId}/favorite` , {
    cache: "no-store",
  }) ;
 
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  return await res.json();
}

// Get Favorite for Organizer
export async function getOrgFavoriteUser(
  orgId: string,
): Promise<ApiRes<CursorData<FavoriteUserlist>>> {
  const res = await serverFetch(`organizations/${orgId}/favorites` , {
    cache: "no-store",
  }) ;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return await res.json();
}

// toggle Favorite 
export async function toggleFavoriteUser(
  userId: string,
  token: string,
): Promise<ApiRes<boolean>> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}users/${userId}/favorite`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  return await res.json();
}

// toggle Favorite for Organizer
export async function toggleOrgFavoriteUser(
  orgId: string,
  token: string,): Promise<ApiRes<boolean>> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}organizations/${orgId}/favorites`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  return await res.json();
}

//getSavedEvents
export async function getSavedEvents(
  userId: string,
): Promise<ApiRes<CursorData<SavedEvent>>> {
  const res = await serverFetch(`users/${userId}/events/saved`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return await res.json();
}

// get saved Events for Organizer
export async function getOrgSavedEvents(
  orgId: string,
): Promise<ApiRes<CursorData<SavedEvent>>> {
  const res = await serverFetch(`organizations/${orgId}/events/saved`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return await res.json();
}

//getSavedActivities
export async function getSavedActivities(
  userId: string,
): Promise<ApiRes<CursorData<ActivitiesResponse>>> {
  const res = await serverFetch(`users/${userId}/activities/saved`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return await res.json();
}

// get saved Activities for Organizer
export async function getOrgSavedActivities(
  orgId: string,
): Promise<ApiRes<CursorData<ActivitiesResponse>>> {
  const res = await serverFetch(`organizations/${orgId}/activities/saved`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return await res.json();
}



// update profile Avatar
export async function updateAvatarClient(
  userId: string,
  file: File,
  token: string,
): Promise<ApiRes<string>> {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}users/${userId}/avatar`,
    {
      method: "PATCH",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  return await res.json();
}
 // update profile Avatar for Organizer
export async function updateOrgAvatarClient(
  orgId: string,
  file: File,
  token: string,
): Promise<ApiRes<string>> {
  const formData = new FormData();
  // formData.append("avatar", file);
  formData.append("logo", file);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}organizations/${orgId}/logo`,
    {
      method: "PATCH",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  return await res.json();

}


// toggle Like Event
export async function toggleLikeEvent(eventId: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}events/${eventId}/like`;


  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
     console.error("Like API error:", res.status, text);
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  return res.json();
}

// Toggle save event
export async function toggleSaveEvent(eventId: string, token: string): Promise<void> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}events/${eventId}/saved`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
}


// Update Password
export async function updatePassword(
  currentPassword: string,
  newPassword: string,
  token: string,
): Promise<ApiRes<boolean>> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}auth/change-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  return await res.json();
}


// Delete Event 
export async function deleteEvent(eventId: string, token: string): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}events/${eventId}`;


  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
}


// get Paid Events
export async function getPaidEvents(): Promise<ApiRes<CursorData<WalletEventList>>> {
  const res = await serverFetch(`organizations/wallet/events/paid`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return await res.json();
}


// delet account
export async function deleteAccount(token: string): Promise<void> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}users`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
}

// delete account for Organizer
export async function deleteOrgAccount(orgId: string, token: string): Promise<void> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}organizations/${orgId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if(!res.ok){
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
} 



// Request to be org
export type CreateOrgPayload = {
  name: string;
  province: string;
  phone: string;
  website?: string;
  about: string;
};

export async function createOrgProfile(payload: CreateOrgPayload): Promise<string> {
  const res = await clientFetch("users/organization", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    if (res.status === 409) {
      // throw new Error("You already have a pending or active organizer request.");
      return "ALREADY_EXISTS";
    }
    throw new Error(errData?.message ?? `Failed to create organizer (${res.status})`);
  }

  const data = await res.json();
  return data.data.orgId as string;
}

export async function requestOrgProfile(orgId: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("logo", file);

  const res = await clientFetch(`users/organization/${orgId}/logo`, {
    method: "PATCH",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to upload logo (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.data.url as string;
}

export async function uploadOrgDocument(orgId: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("document", file);

  const res = await clientFetch(`users/organization/${orgId}/document`, {
    method: "PATCH",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to upload document (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.data.url as string;
}

export async function patchOrgDocumentUrl(orgId: string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append("document", file);

  const res = await clientFetch(`users/organization/${orgId}/document`, {
    method: "POST", 
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.message ?? `Failed to submit document URL (${res.status})`);
  }
}


// ── Client-side "load more" pages for the profile tabs ──────────────────
// Previously inlined in components/profile/*; same endpoints and errors.

async function fetchCursorPage<T>(endpoint: string): Promise<CursorData<T>> {
  const res = await clientFetch(endpoint);
  if (!res.ok) throw new Error(`API Error ${res.status}`);
  const json = await res.json();
  return json.data;
}

export async function getAttendedEventsPage(
  userId: string,
  cursor: string,
): Promise<CursorData<EventProfileRespone>> {
  return fetchCursorPage(`users/${userId}/events/attended?cursor=${cursor}`);
}

export async function getCreatedEventsPage(
  profileId: string,
  cursor: string,
  isOrgProfile: boolean,
  status: string,
): Promise<CursorData<EventProfileRespone>> {
  return fetchCursorPage(
    isOrgProfile
      ? `organizations/${profileId}/events/created?cursor=${cursor}`
      : `users/${profileId}/events/created?status=${status}&cursor=${cursor}`,
  );
}

export async function getActivitiesPage(
  profileId: string,
  cursor: string,
  isOrgProfile: boolean,
): Promise<CursorData<ActivitiesResponse>> {
  return fetchCursorPage(
    isOrgProfile
      ? `organizations/${profileId}/activities?cursor=${cursor}`
      : `users/${profileId}/activities?cursor=${cursor}`,
  );
}

export async function getSavedEventsPage(
  profileId: string,
  cursor: string,
  isOrgProfile: boolean,
): Promise<CursorData<EventProfileRespone>> {
  return fetchCursorPage(
    isOrgProfile
      ? `organizations/${profileId}/events/saved?cursor=${cursor}`
      : `users/${profileId}/events/saved?cursor=${cursor}`,
  );
}

export async function getSavedActivitiesPage(
  profileId: string,
  cursor: string,
  isOrgProfile: boolean,
): Promise<CursorData<ActivitiesResponse>> {
  return fetchCursorPage(
    isOrgProfile
      ? `organizations/${profileId}/activities/saved?cursor=${cursor}`
      : `users/${profileId}/activities/saved?cursor=${cursor}`,
  );
}

// Loads a protected avatar image and returns an object URL for <Image src>.
export async function getAvatarDisplayUrl(avatar: string, token: string): Promise<string> {
  const url = avatar.startsWith("http")
    ? avatar
    : `${process.env.NEXT_PUBLIC_API_URL}media/images/${avatar}`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Failed to load image");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
