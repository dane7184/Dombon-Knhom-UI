export type WithdrawalResponse = {
  withdrawalId: string;
  orgName: string;
  amount: number;
  requestDate: string;
  status: "Approved" | "Rejected" | "Pending";
};

export const mockWithdrawals: WithdrawalResponse[] = [
  {
    withdrawalId: "1",
    orgName: "Youth Cambodia",
    amount: 2230,
    requestDate: "May 26, 2026",
    status: "Pending",
  },
  {
    withdrawalId: "2",
    orgName: "Dara Events",
    amount: 1230,
    requestDate: "May 24, 2026",
    status: "Approved",
  },
  {
    withdrawalId: "3",
    orgName: "Vechey Group",
    amount: 1430,
    requestDate: "May 20, 2026",
    status: "Rejected",
  },
  {
    withdrawalId: "4",
    orgName: "Khmer Vibes",
    amount: 1290,
    requestDate: "May 18, 2026",
    status: "Pending",
  },
  {
    withdrawalId: "5",
    orgName: "Angkor Event",
    amount: 1239,
    requestDate: "May 15, 2026",
    status: "Approved",
  },
  {
    withdrawalId: "6",
    orgName: "Phnom Social",
    amount: 2220,
    requestDate: "May 12, 2026",
    status: "Rejected",
  },
  {
    withdrawalId: "7",
    orgName: "CamEvent Co.",
    amount: 1130,
    requestDate: "May 06, 2026",
    status: "Pending",
  },
  {
    withdrawalId: "8",
    orgName: "Lotus Events",
    amount: 1120,
    requestDate: "Apr 29, 2026",
    status: "Approved",
  },
  {
    withdrawalId: "9",
    orgName: "Sunrise Organizer",
    amount: 2238,
    requestDate: "Apr 25, 2026",
    status: "Pending",
  },
  {
    withdrawalId: "10",
    orgName: "Sokha Co.",
    amount: 3239,
    requestDate: "Apr 14, 2026",
    status: "Pending",
  },
  {
    withdrawalId: "11",
    orgName: "Sabay Digital",
    amount: 1850,
    requestDate: "Apr 10, 2026",
    status: "Approved",
  },
  {
    withdrawalId: "12",
    orgName: "Kbach Arts",
    amount: 980,
    requestDate: "Mar 28, 2026",
    status: "Rejected",
  },
  {
    withdrawalId: "13",
    orgName: "Smart Lifestyle",
    amount: 4120,
    requestDate: "Mar 15, 2026",
    status: "Pending",
  },
  {
    withdrawalId: "14",
    orgName: "Cellcard Events",
    amount: 2600,
    requestDate: "Mar 02, 2026",
    status: "Approved",
  },
  {
    withdrawalId: "15",
    orgName: "Barcamp Cam",
    amount: 750,
    requestDate: "Feb 20, 2026",
    status: "Pending",
  },
  {
    withdrawalId: "16",
    orgName: "Phnom Penh Arts",
    amount: 3400,
    requestDate: "Feb 11, 2026",
    status: "Approved",
  },
  {
    withdrawalId: "17",
    orgName: "Impact Hub",
    amount: 1150,
    requestDate: "Jan 29, 2026",
    status: "Pending",
  },
  {
    withdrawalId: "18",
    orgName: "National Sports",
    amount: 5000,
    requestDate: "Jan 15, 2026",
    status: "Rejected",
  },
  {
    withdrawalId: "19",
    orgName: "Smart Axiata",
    amount: 2990,
    requestDate: "Jan 04, 2026",
    status: "Approved",
  },
  {
    withdrawalId: "20",
    orgName: "Biz Cambodia",
    amount: 1340,
    requestDate: "Dec 22, 2025",
    status: "Pending",
  },
];
