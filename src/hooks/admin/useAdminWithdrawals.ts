"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useAuth} from "@/hooks/useAuth";
import {getAllTransactions, getWithdrawals, updateWithdrawalStatus} from "@/services/admin.service";
import {FetchTransactionsParams} from "@/types/admin.type";

export function useAdminWithdrawals(status?: "Approved" | "Rejected" | "Pending") {
    const { isLoading } = useAuth();

    return useQuery({
        queryKey: ["admin", "withdrawals", status ?? "all"],
        queryFn: () => getWithdrawals({ size: 100, status }),
        enabled: !isLoading,
    });
}

export function useUpdateWithdrawalStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            withdrawalId,
            status,
            transactionRef,
            proof,
        }: {
            withdrawalId: string;
            status: "Approved" | "Rejected";
            transactionRef?: string;
            proof?: File;
        }) => updateWithdrawalStatus(withdrawalId, status, transactionRef, proof),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["admin", "withdrawals"] });
        },
    });
}

export function useAdminTransactions(params: FetchTransactionsParams) {
    const {isLoading} = useAuth();

    return useQuery({
        queryKey: ["admin", "transactions", params],
        queryFn: () => getAllTransactions(params),
        enabled: !isLoading,
    });
}