"use client";
import React, { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/dashboard/moderator/Dropdown";
import { PaginationTable } from "@/components/dashboard/moderator/PaginationTable";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import UserTable from "@/components/dashboard/system-admin/UserTable";
import OrganizerTable from "@/components/dashboard/system-admin/OrganizerTable";
import ModeratorTable from "@/components/dashboard/system-admin/ModeraterTable";
import Toast from "@/components/modals/Toast";
import { useToast } from "@/hooks/useToast";
import ProfilePopUp from "@/components/dashboard/system-admin/ProfilePopUp";
import DeleteConfirmPopup from "@/components/dashboard/system-admin/DeleteConfirmPopupProps";
import CreateAccountModal from "@/components/dashboard/system-admin/CreateAccountModal";
import EditAccountModal from "@/components/dashboard/system-admin/EditAccountModalProps";
import {
  useAdminUsers,
  useAdminOrganizers,
  useAdminModerators,
  useProfileDetail,
  useDeleteUser,
  useDeleteOrganizer,
  useDeleteModerator,
  ProfileTarget,
} from "@/hooks/admin/useAdminAccounts";
import { AdminUser, AdminOrganizer, AdminModerator } from "@/types/admin.type";

export type TabType = "user" | "organizer" | "moderator";
export type UserRowType = AdminUser | AdminOrganizer | AdminModerator;

const STATUS_OPTIONS: Record<TabType, { value: string; label: string }[]> = {
  user: [
    { value: "", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ],
  organizer: [
    { value: "", label: "All Status" },
    { value: "Approved", label: "Approved" },
    { value: "Pending", label: "Pending" },
    { value: "Rejected", label: "Rejected" },
  ],
  moderator: [
    { value: "", label: "All Genders" },
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ],
};

const TAB_OPTIONS = [
  { value: "user", label: "User" },
  { value: "organizer", label: "Organizer" },
  { value: "moderator", label: "Moderator" },
];

const ITEMS_PER_PAGE = 11;

export default function UserManagement() {
  const [curTab, setCurTab] = useState<TabType>("user");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [profileTarget, setProfileTarget] = useState<ProfileTarget | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<UserRowType | null>(null);
  const [editTarget, setEditTarget] = useState<UserRowType | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [createPopupOpen, setCreatePopupOpen] = useState(false);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const { toastData, showToast, hideToast } = useToast();

  const usersQuery = useAdminUsers(
    {
      status: statusFilter || undefined,
      page: currentPage,
      size: ITEMS_PER_PAGE,
    },
    curTab === "user",
  );
  const organizersQuery = useAdminOrganizers(
    {
      status: statusFilter || undefined,
      page: currentPage,
      size: ITEMS_PER_PAGE,
      statusFilter,
    },
    curTab === "organizer",
  );
  const moderatorsQuery = useAdminModerators(
    {
      gender: (statusFilter || undefined) as "Male" | "Female" | undefined,
      page: currentPage,
      size: ITEMS_PER_PAGE,
    },
    curTab === "moderator",
  );

  const users = usersQuery.data?.content ?? [];
  const organizers = organizersQuery.data?.content ?? [];
  const moderators = moderatorsQuery.data?.content ?? [];

  const { data: profileDetail, isLoading: profileLoading } = useProfileDetail(
    profileTarget,
    popupOpen,
  );
  const deleteUserMutation = useDeleteUser();
  const deleteOrganizerMutation = useDeleteOrganizer();
  const deleteModeratorMutation = useDeleteModerator();

  const handleView = (row: UserRowType) => {
    const target =
      "orgId" in row
        ? { id: row.orgId, type: "organizer" as const }
        : "province" in row
          ? { id: row.userId, type: "moderator" as const }
          : { id: row.userId, type: "user" as const };

    setProfileTarget(target);
    setPopupOpen(true);
  };
  const handleEdit = (row: UserRowType) => {
    setEditTarget(row);
    setEditPopupOpen(true);
  };
  const handleDelete = (row: UserRowType) => {
    setDeleteTarget(row);
    setDeletePopupOpen(true);
  };

  // Delete calls api
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setDeletePopupOpen(false);

    const name =
      (deleteTarget as AdminUser).fullName ||
      (deleteTarget as AdminOrganizer).orgName ||
      "Account";

    const callbacks = {
      onSuccess: () =>
        showToast({
          type: "success",
          title: "Deleted successfully!",
          message: `"${name}" was deleted.`,
        }),
      onError: (err: unknown) => {
        console.error("Failed to delete account:", err);
        showToast({
          type: "error",
          title: "Delete failed!",
          message: `"${name}" could not be deleted.`,
        });
      },
    };

    if (curTab === "user") {
      deleteUserMutation.mutate((deleteTarget as AdminUser).userId, callbacks);
    } else if (curTab === "organizer") {
      deleteOrganizerMutation.mutate(
        (deleteTarget as AdminOrganizer).orgId,
        callbacks,
      );
    } else if (curTab === "moderator") {
      deleteModeratorMutation.mutate(
        (deleteTarget as AdminModerator).userId,
        callbacks,
      );
    }

    setDeleteTarget(null);
  };

  // After create succeeds, jump back to page 1 so the new entry is visible
  const handleCreated = () => {
    setCurrentPage(1);
  };

  // Render
  return (
    <div className="bg-white p-6 rounded-2xl flex flex-col h-full border border-gray-100 shadow-sm">
      {toastData && (
        <Toast
          type={toastData.type}
          title={toastData.title}
          message={toastData.message}
          onCloseAction={hideToast}
        />
      )}

      <Tabs
        value={curTab}
        onValueChange={(v) => {
          setCurTab(v as TabType);
          setCurrentPage(1);
          setStatusFilter("");
        }}
        className="w-full flex-1 min-h-0 flex flex-col"
      >
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 shrink-0">
          <DashboardTabs options={TAB_OPTIONS} />
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {curTab !== "organizer" && (
              <Button
                type="button"
                onClick={() => setCreatePopupOpen(true)}
                className="h-10 rounded-xl bg-(--main-color) px-4 text-white hover:bg-(--main-color)/80 font-medium text-[15px] cursor-pointer shadow-none"
              >
                {curTab === "moderator"
                  ? "+ Create moderator"
                  : "+ Create user"}
              </Button>
            )}
            <Dropdown
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
              options={STATUS_OPTIONS[curTab]}
            />
          </div>
        </div>

        {/* Tables */}
        <TabsContent
          value="user"
          className="w-full flex-1 min-h-0 flex flex-col mt-0 mb-6 data-[state=inactive]:hidden"
        >
          <UserTable
            data={users}
            pageOffset={(currentPage - 1) * ITEMS_PER_PAGE}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
        <TabsContent
          value="organizer"
          className="w-full flex-1 min-h-0 flex flex-col mt-0 mb-6 data-[state=inactive]:hidden"
        >
          <OrganizerTable
            data={organizers}
            pageOffset={(currentPage - 1) * ITEMS_PER_PAGE}
            onView={handleView}
            onDelete={handleDelete}
          />
        </TabsContent>
        <TabsContent
          value="moderator"
          className="w-full flex-1 min-h-0 flex flex-col mt-0 mb-6 data-[state=inactive]:hidden"
        >
          <ModeratorTable
            data={moderators}
            pageOffset={(currentPage - 1) * ITEMS_PER_PAGE}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      <div className="pt-6 border-t border-gray-50 shrink-0">
        <PaginationTable
          totalItems={
            curTab === "user"
              ? (usersQuery.data?.totalElements ?? users.length)
              : curTab === "organizer"
                ? (organizersQuery.data?.totalElements ?? organizers.length)
                : (moderatorsQuery.data?.totalElements ?? moderators.length)
          }
          itemsPerPage={ITEMS_PER_PAGE}
          currentPage={currentPage}
          onPageChange={(page) => {
            const totalItems =
              curTab === "user"
                ? (usersQuery.data?.totalElements ?? users.length)
                : curTab === "organizer"
                  ? (organizersQuery.data?.totalElements ?? organizers.length)
                  : (moderatorsQuery.data?.totalElements ?? moderators.length);
            const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
            if (page >= 1 && page <= totalPages) {
              setCurrentPage(page);
            }
          }}
        />
      </div>

      {/* View popup — displays profile details */}
      <ProfilePopUp
        isOpen={popupOpen}
        isClose={() => {
          setPopupOpen(false);
          setProfileTarget(null);
        }}
        detail={profileDetail ?? null}
        loading={profileLoading}
      />

      {/* Delete confirmation popup */}
      <DeleteConfirmPopup
        isOpen={deletePopupOpen}
        isClose={() => {
          setDeletePopupOpen(false);
          setDeleteTarget(null);
        }}
        displayName={
          (deleteTarget as AdminUser)?.fullName ||
          (deleteTarget as AdminOrganizer)?.orgName ||
          (deleteTarget as AdminModerator)?.fullName ||
          "this account"
        }
        onConfirm={confirmDelete}
      />

      {/* Create modal */}
      <CreateAccountModal
        isOpen={createPopupOpen}
        role={curTab === "moderator" ? "moderator" : "user"}
        onClose={() => setCreatePopupOpen(false)}
        onSuccess={(msg) => {
          showToast({
            type: "success",
            title: "Created successfully!",
            message: msg,
          });
          handleCreated();
        }}
        onError={(msg) => {
          showToast({ type: "error", title: "Create failed!", message: msg });
        }}
      />

      {/* Edit modal */}
      <EditAccountModal
        isOpen={editPopupOpen}
        key={
          (editTarget as AdminUser)?.userId ||
          (editTarget as AdminModerator)?.userId ||
          (editTarget as AdminOrganizer)?.orgId ||
          "empty"
        }
        onClose={() => {
          setEditPopupOpen(false);
          setEditTarget(null);
        }}
        row={editTarget}
        role={curTab}
        onSuccess={(msg: string) =>
          showToast({
            type: "success",
            title: "Updated successfully!",
            message: msg,
          })
        }
        onError={(msg: string) =>
          showToast({ type: "error", title: "Update failed!", message: msg })
        }
      />
    </div>
  );
}
