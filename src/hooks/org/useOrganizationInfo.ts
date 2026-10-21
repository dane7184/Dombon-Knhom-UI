import {signOut, useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import {organizationInfo} from "@/types/organizer.type";
import {deleteAccountOrganizer, organizationInfoService} from "@/services/organizer.service";

export function useOrganizationInfo() {
    const { data: session, status } = useSession();
    const [infoOrg, setInfoOrg] = useState<organizationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInfo = async () => {

            if (status === "loading") return;

            try {
                setLoading(true);
                setError(null);

                const orgId = session?.user.orgId;
                const orgToken = session?.user.accessToken;

                if (!orgId || !orgToken) {
                    throw new Error("Organization information not found");
                }

                const infoData = await organizationInfoService(orgId, orgToken);
                setInfoOrg(infoData);
            } catch (error) {

                setError(error instanceof Error ? error.message : "Failed to load organization");
                setInfoOrg(null);
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, [session?.user.accessToken, session?.user.orgId, status]);

    return {
        infoOrg,
        loading,
        error,
    }
}

export function useDeleteAccount() {
    const { data: session } = useSession();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteAccount = async (): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            const orgId = session?.user?.orgId;
            const orgToken = session?.user?.accessToken;

            if (!orgId || !orgToken) {
                throw new Error("Organization information not found");
            }

            await deleteAccountOrganizer(orgId, orgToken);

            await signOut({ redirect: false });

            return true;
        } catch (err) {
            console.error("deleteAccount error:", err);
            setError(err instanceof Error ? err.message : "Failed to delete organization");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { deleteAccount, loading, error };
}