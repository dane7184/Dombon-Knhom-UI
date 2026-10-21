"use client";
import "@/app/globals.css";
import { Verify, Unlock, Trash } from "iconsax-react";
import { AccountSettingRequest } from "@/types/user.type";
import ChangePasswordModal from "../modals/ChangePasswordModal";
import RequestOrgModal from "../modals/RequestOrgModal";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  deleteOrgAccount,
  deleteAccount,
} from "@/services/profileInfo.service";
import { BaseModal } from "./BaseModal";
import { Trash2 } from "lucide-react";

export const AccountSetting = ({
  isOrganizer,
  orgId,
  hasOrg,
}: AccountSettingRequest) => {
  const { data: session } = useSession();
  const router = useRouter();
  const handleDeleteAccount = async () => {
    const token = session?.user?.accessToken;
    if (!token) return;

    if (isOrganizer && orgId) {
      await deleteOrgAccount(orgId, token);
    } else {
      await deleteAccount(token);
    }

    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <div className="p-5 bg-(--background-white) mt-5 rounded-[15px] border card-shadow border-(--input-border) w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] sm:text-[20px] font-bold text-main">Account Setting</h2>
      </div>
      <div className="mt-5">
        <hr className="border-(--input-border)" />
      </div>
      <div className="space-y-4 mt-5">
        <div>
          {!isOrganizer && (
            <>
              {" "}
              <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-5 rounded-[15px] sm:justify-between border border-(--input-border) pb-4 gap-4 sm:gap-0">
                <div className="flex gap-3 sm:gap-5">
                  <div className="p-3 sm:p-5 border-2 rounded-full border-(--input-border) flex-shrink-0 flex items-center justify-center">
                    <Unlock color="#424242" size={32} />
                  </div>
                  <div className="pt-1 sm:pt-2 min-w-0 flex-1">
                    <h3 className="text-base sm:text-[18px] font-medium text-main">
                      Change Password
                    </h3>
                    <p className="text-[16px] text-secondary">
                      Update your current password
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ChangePasswordModal />
                </div>
              </div>
              {!orgId && (
                <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-5 rounded-[15px] sm:justify-between border border-(--input-border) pb-4 mt-5 gap-4 sm:gap-0">
                  <div className="flex gap-3 sm:gap-5">
                    <div className="p-3 sm:p-5 border-2 rounded-full border-(--input-border) flex-shrink-0 flex items-center justify-center">
                      <Verify color="#424242" size={32} />
                    </div>

                    <div className="pt-1 sm:pt-2 min-w-0 flex-1">
                      <h3 className="text-base sm:text-[18px] font-medium text-main">
                        Request to be organizer
                      </h3>
                      <p className="text-sm sm:text-[16px] text-secondary">
                        Request your account to an organization account to post
                        events without approval requests.
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <RequestOrgModal alreadyRequested={hasOrg} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-5 rounded-[15px] sm:justify-between border border-(--accent-color) pb-4 gap-4 sm:gap-0">
          <div className="flex gap-3 sm:gap-5">
            <div className="p-3 sm:p-5 border-[1.8px] rounded-full border-(--accent-color) flex-shrink-0 flex items-center justify-center">
              <Trash color="#FF383C" size={32} />
            </div>
            <div className="pt-1 sm:pt-2 min-w-0 flex-1">
              <h3 className="text-[18px] font-medium text-main">
                Delete{isOrganizer ? " Organizer" : " "} Account
              </h3>
              <p className="text-[16px] text-secondary">
                {isOrganizer ? "Your organizer account will be permanently removed." : "Your account can be reactivated within 30 days before it is permanently removed."}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <BaseModal
              variant="delete"
              title={
                isOrganizer ? "Delete Organizer Account" : "Delete Account"
              }
              description={isOrganizer ? "Your organizer account will be permanently removed." : "Your account can be reactivated within 30 days before it is permanently removed."}
              confirmLabel="Delete"
              onConfirm={handleDeleteAccount}
            >
              <button className="flex cursor-pointer justify-center py-2.5 px-5 rounded-xl w-full sm:w-45 text-center text-white bg-[#ff4d57] hover:bg-[#ff3944]">
                <Trash2 color="#fff" size={20} className="me-2" />
                Delete
              </button>
            </BaseModal>
          </div>
        </div>
      </div>
    </div>
  );
};
