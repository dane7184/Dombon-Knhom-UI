import React from 'react'
import { AccountSetting } from '../AccountSetting'
import { PersonalInformation } from '../PersonalInfomation'
import { ProfileInfoType } from '@/types/user.type'
import { notFound } from 'next/navigation'

interface InfoTabProps {
  profile: ProfileInfoType;
}

export default function InfoTab({ profile }: InfoTabProps) {
  if (!profile) {
    notFound();
  }

  const userId = profile.userId ?? '';

  return (
    <div className='pb-5'>
      <PersonalInformation userId={userId} /> 
      <AccountSetting id={userId} isOrganizer={profile.isOrganizer ?? profile.role === 'Organizer'} orgId={profile.orgId ?? null} hasOrg={profile.hasOrg ?? false} />
    </div>
  )
}