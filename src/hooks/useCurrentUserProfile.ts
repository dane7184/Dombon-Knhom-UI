import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUserProfile } from "@/services/user.service";

export const useCurrentUserProfile = () => {
  const { accessToken, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["currentUserProfile", accessToken],
    queryFn: async () => {
      if (!accessToken) return null;
      return getCurrentUserProfile(accessToken);
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};
