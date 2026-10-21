"use client";

import { useMutation } from "@tanstack/react-query";
import {
  createOrgProfile,
  patchOrgDocumentUrl,
  requestOrgProfile,
} from "@/services/profileInfo.service";
import { RequestOrganizerInput } from "@/types/schemas/profile.schema";

export type RequestOrganizerResult = "created" | "already_exists";

export function useRequestOrganizer() {
  return useMutation<RequestOrganizerResult, Error, RequestOrganizerInput>({
    mutationFn: async (form) => {
      const orgId = await createOrgProfile({
        name: form.fullName,
        province: form.province,
        phone: form.phone,
        website: form.website || "",
        about: form.about,
      });

      if (orgId === "ALREADY_EXISTS") {
        return "already_exists";
      }

      if (form.profileImage) {
        await requestOrgProfile(orgId, form.profileImage);
      }

      await patchOrgDocumentUrl(orgId, form.verificationDocument);

      return "created";
    },
  });
}
