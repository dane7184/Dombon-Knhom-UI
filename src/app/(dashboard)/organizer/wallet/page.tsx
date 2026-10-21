import React from "react";
import WalletChart from "@/components/dashboard/organizer/WalletChart";
import CurrentBalance from "@/components/dashboard/organizer/CurrentBalance";
import TransactionTable from "@/components/dashboard/organizer/TransactionTable";
import {getCurrentBalanceAction, getRecentTransactionAction, getTotalEarning} from "@/actions/organizer.action";

export default async function WalletPage() {
  const [walletChart, balance, transactions] = await Promise.all([
    getTotalEarning(),
    getCurrentBalanceAction(),
    getRecentTransactionAction(),
  ]);

  return (
      <div className="w-full flex flex-col 4xl:p-5 xl:p-0">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 xl:gap-4 w-full">
          <div className="xl:col-span-3 bg-white rounded-2xl p-5 card-shadow w-full flex flex-col min-h-95">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-[17px] font-bold secondary-color">Total Earning</h2>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-main" />
                <span className="text-xs font-medium text-[#94a3b8]">Money</span>
              </div>
            </div>
            <WalletChart
                data={walletChart.data}
                error={walletChart.error ?? null}
            />
          </div>

          <div className="xl:col-span-1 w-full h-full min-h-62">
            <CurrentBalance data={balance.data} error={balance.error ?? null} />
          </div>
        </div>

        <TransactionTable data={transactions.data} error={transactions.error ?? null} />
      </div>
  );
}