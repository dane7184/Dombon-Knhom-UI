'use client';
import { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProfileTabBar from '@/components/profile/ProfileTabBar';

interface ProfileTabsClientProps {
    profileId: string;
    currentUserId: string;
    currentUserOrgId: string | null;
    isCurrentUser: boolean;
    isSessionInOrgMode: boolean;
    children: React.ReactNode; 
}

function TabBarInner({ profileId, currentUserId, currentUserOrgId, isCurrentUser, isSessionInOrgMode }: Omit<ProfileTabsClientProps, 'children'>) {
    const { isOrgMode } = useAuth();
    return (
        <ProfileTabBar
            profileId={profileId}
            currentUserId={currentUserId}
            currentUserOrgId={currentUserOrgId}
            isOrgMode={isOrgMode}
            isCurrentUser={isCurrentUser}
            isSessionInOrgMode={isSessionInOrgMode}
        />
    );
}

export default function ProfileTabsClient({ children, ...props }: ProfileTabsClientProps) {
    return (
        <div>
            <Suspense fallback={null}>
                <TabBarInner {...props} />
            </Suspense>
            <div className="mt-5">
                {children}
            </div>
        </div>
    );
}