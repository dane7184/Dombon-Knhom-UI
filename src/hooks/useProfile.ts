"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  getPersonalOrgProfile,
  getPersonalProfile,
  updateOrgProfile,
  updateUserProfile,
} from "@/services/profileInfo.service";
import { PersonalInfoFormValues } from "@/types/schemas/profile.schema";

export type PersonalProfileData = PersonalInfoFormValues & { email: string };

export function usePersonalProfile(userId: string) {
  const { accessToken, isAuthenticated, isOrgMode, orgId, user } = useAuth();

  return useQuery<PersonalInfoFormValues, Error, PersonalProfileData>({
    queryKey: ["personalProfile", isOrgMode ? orgId : userId, isOrgMode],
    queryFn: async (): Promise<PersonalInfoFormValues> => {
      if (isOrgMode && orgId) {
        const org = await getPersonalOrgProfile(orgId);
        return {
          fullName: org.fullName,
          bio: org.bio,
          gender: "",
          phone: org.phone,
          website: org.website,
        };
      }

      const data = await getPersonalProfile(userId);
      return {
        fullName: data.fullName ?? "",
        bio: data.bio ?? "",
        gender: (data.gender as "Male" | "Female" | undefined) ?? "",
        phone: "",
        website: "",
      };
    },
    enabled: isAuthenticated && !!accessToken && !!userId,
    staleTime: 60 * 1000,
    select: (data) => ({ ...data, email: user?.email ?? "" }),
  });
}

export function useUpdateProfile() {
  const { isOrgMode, orgId } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (form: PersonalInfoFormValues) => {
      if (isOrgMode && orgId) {
        await updateOrgProfile(orgId, form);
        return;
      }
      await updateUserProfile(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personalProfile"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      router.refresh();
    },
  });
}
