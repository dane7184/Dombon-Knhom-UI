import React from 'react'
import WalletEventComponent from '../WalletEventComponent'
import CurrentBalance from '@/components/dashboard/organizer/CurrentBalance'
import {getPaidEvents} from '@/services/profileInfo.service';
import {getCurrentBalanceAction} from "@/actions/organizer.action";

export default async function WalletTab() {
    const [balance] = await Promise.all([
        getCurrentBalanceAction(),
    ]);
    const res = await getPaidEvents()
    const events = res.data.content;
    return (
        <div className='flex flex-col md:flex-row gap-5'>
            <div className='w-full md:w-1/3'>
                <div className='md:sticky md:top-25'>
                    <CurrentBalance data={balance.data} error={balance.error ?? null} />
                </div>
            </div>
            <div className='w-full md:w-2/3 flex flex-col gap-3 p-5 bg-white rounded-lg shadow-md'>
                <h3 className='text-[20px]'>Paid Events</h3>
                {events.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-2">
                        <p className="text-desc text-sm font-medium">No paid events found.</p>
                    </div>
                )}
                {events.map((event) => (
                    <WalletEventComponent key={event.eventId} {...event} />
                ))}
            </div>
        </div>
    )
}
