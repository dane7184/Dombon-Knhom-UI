export interface ProfileTabs{
    id: string
    name: string
}



export const profileTabs: ProfileTabs[] = [
    {
        id: "posts",
        name: "POSTS",
    },
    {
        id: "attended",
        name: "ATTENDED EVENTS",
    },
    {
        id: "created",
        name: "CREATED EVENTS",
    },
    {
        id: "favorite",
        name: "FAVORITE",
    },
    {
        id: "saved",
        name: "SAVED",
    },
    {
        id: "info",
        name: "INFO",
    },

]
export const orgProfileTabs: ProfileTabs[] = [
    {
        id: "posts",
        name: "POSTS",
    },
    {
        id: "created",
        name: "CREATED EVENTS",
    },
    {
        id: "favorite",
        name: "FAVORITE",
    },
    {
        id: "saved",
        name: "SAVED",
    },
    {
        id: "wallet",
        name: "WALLET",
    },
    {
        id: "info",
        name: "INFO",
    },
]


export const profileTabsForOther: ProfileTabs[] = [
    {
        id: "posts",
        name: "POSTS",
    },

    {
        id: "created",
        name: "CREATED EVENTS",
    }
]

export const profileTabFn = (
  profileId: string,
  userId: string,
  orgId: string | null,
  isCurrentUser: boolean  
): ProfileTabs[] => {
  if (!isCurrentUser) return profileTabsForOther;
  if (orgId && orgId === profileId) return orgProfileTabs;

  return profileTabs;
};


export interface WalletCardResponse {
    balance: number
}