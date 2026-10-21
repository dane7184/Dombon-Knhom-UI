"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
    createModerator,
    createUser,
    deleteModerator,
    deleteOrganizer,
    deleteUser,
    getAllModerators,
    getAllOrganizers,
    getAllUsers,
    getModeratorById,
    getOrganizerById,
    getUserById,
    updateModerator,
    updateOrganizer,
    updateUser,
} from "@/services/admin.service";
import {
    CreateModeratorBody,
    CreateUserBody,
    FetchModeratorsParams,
    FetchOrganizersParams,
    FetchUsersParams,
    ModeratorDetail,
    OrganizerDetail,
    UpdateModeratorBody,
    UpdateOrganizerBody,
    UpdateUserBody,
    UserDetail,
} from "@/types/admin.type";

export function useAdminUsers(params: FetchUsersParams, enabled = true) {
    const { isLoading } = useAuth();

    return useQuery({
        queryKey: ["admin", "users", params],
        queryFn: () => getAllUsers(params),
        enabled: !isLoading && enabled,
    });
}

export function useAdminOrganizers(
    params: FetchOrganizersParams & { statusFilter?: string },
    enabled = true,
) {
    const { isLoading } = useAuth();
    const { statusFilter, ...rest } = params;

    return useQuery({
        queryKey: ["admin", "organizers", rest, statusFilter],
        queryFn: async () => {
            const { content, ...pagination } = await getAllOrganizers(rest);
            const filtered = statusFilter
                ? content.filter((org) => org.status?.toLowerCase() === statusFilter.toLowerCase())
                : content;

            return {
                content: filtered,
                ...pagination,
                totalElements: statusFilter ? filtered.length : pagination.totalElements,
            };
        },
        enabled: !isLoading && enabled,
    });
}

export function useAdminModerators(params: FetchModeratorsParams, enabled = true) {
    const { isLoading } = useAuth();

    return useQuery({
        queryKey: ["admin", "moderators", params],
        queryFn: () => getAllModerators(params),
        enabled: !isLoading && enabled,
    });
}

export type ProfileTarget = { id: string; type: "user" | "moderator" | "organizer" };

export function useProfileDetail(target: ProfileTarget | null, enabled: boolean) {
    const { isLoading } = useAuth();

    return useQuery<UserDetail | ModeratorDetail | OrganizerDetail | null>({
        queryKey: ["admin", "profile", target?.type, target?.id],
        queryFn: () => {
            if (!target) return null;
            if (target.type === "user") return getUserById(target.id);
            if (target.type === "moderator") return getModeratorById(target.id);
            return getOrganizerById(target.id);
        },
        enabled: !isLoading && enabled && !!target,
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => deleteUser(userId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
    });
}

export function useDeleteOrganizer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orgId: string) => deleteOrganizer(orgId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "organizers"] }),
    });
}

export function useDeleteModerator() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => deleteModerator(userId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "moderators"] }),
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateUserBody) => createUser(body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
    });
}

export function useCreateModerator() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateModeratorBody) => createModerator(body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "moderators"] }),
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, body }: { userId: string; body: UpdateUserBody }) =>
            updateUser(userId, body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
    });
}

export function useUpdateModerator() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, body }: { userId: string; body: UpdateModeratorBody }) =>
            updateModerator(userId, body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "moderators"] }),
    });
}

export function useUpdateOrganizer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orgId, body }: { orgId: string; body: UpdateOrganizerBody }) =>
            updateOrganizer(orgId, body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "organizers"] }),
    });
}
