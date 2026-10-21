'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { profileTabFn } from '@/types/profile.type';
import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface ProfileTabBarProps {
  profileId: string;
  currentUserId: string;
  currentUserOrgId: string | null;
  isOrgMode?: boolean;
  isCurrentUser: boolean;
  isSessionInOrgMode: boolean;
}

export default function ProfileTabBar({
  profileId,
  currentUserId,
  currentUserOrgId,
  isOrgMode,
  isCurrentUser,
  isSessionInOrgMode,
}: ProfileTabBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') ?? 'posts';

  const profileTabs = profileTabFn(profileId, currentUserId, currentUserOrgId, isCurrentUser);

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeIndex = profileTabs.findIndex((tab) => tab.id === activeTab);
    const el = tabRefs.current[activeIndex];
    if (el) {
      setIndicatorStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
      });
    }
  }, [activeTab, profileTabs]);

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);

    if (tabId === 'created') {
      params.set('status', 'Published');
    } else {
      params.delete('status');
    }

    if (tabId === 'saved') {
      params.set('content', 'Event');
    } else {
      params.delete('content');
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full px-3 sm:px-6 md:px-10 pt-2 pb-0 bg-(--background-white) rounded-[15px]">
      <div className="relative flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {profileTabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[index] = el; }}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 sm:gap-4 px-3 sm:px-5 md:px-6 py-3 sm:py-4 font-medium text-sm sm:text-md cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'text-(--main-color)'
                : 'text-secondary hover:text-gray-800'
            }`}
          >
            {tab.name}
          </button>
        ))}

        {/* animated underline */}
        <motion.div
          className="absolute bottom-0 h-[2px] bg-(--main-color)"
          animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      </div>
    </div>
  );
}