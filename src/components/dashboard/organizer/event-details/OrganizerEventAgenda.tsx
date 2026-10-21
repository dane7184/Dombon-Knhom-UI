import { CalendarDays, Clock3, User2 } from "lucide-react";

import {OrganizerEventDetail} from "@/types/organizer.type";

export default function OrganizerEventAgenda({ event }: { event: OrganizerEventDetail }) {
    const segments = [
        { day: "Day 1", date: event.date.split(" - ")[0] ?? event.date },
        { day: "Day 2", date: event.date.split(" - ")[1] ?? event.date },
    ];

    return (
        <section className="rounded-[24px] bg-white p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-bold secondary-color">Event Agenda</h2>
                    <p className="text-sm text-slate-500">Local mock schedule for the organizer dashboard.</p>
                </div>
            </div>

            <div className="space-y-5">
                {segments.map((segment, index) => (
                    <div key={segment.day} className="space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#18abc6] px-3 py-1.5 text-xs font-semibold text-white">
                            {segment.day}
                            <span className="rounded-full bg-white/20 px-2 py-0.5">{segment.date}</span>
                        </div>
                        {event.agenda.slice(index * 2, index * 2 + 2).map((item) => (
                            <div key={`${segment.day}-${item.time}-${item.title}`} className="grid grid-cols-[84px_1fr_auto] gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                                <div className="inline-flex items-center gap-2 text-slate-600">
                                    <Clock3 size={14} />
                                    {item.time}
                                </div>
                                <div className="flex items-center gap-2 text-slate-700">
                                    <CalendarDays size={14} className="text-(--main-color)" />
                                    <span className="font-medium">{item.title}</span>
                                </div>
                                <div className="inline-flex items-center gap-2 text-slate-500">
                                    <User2 size={14} />
                                    {item.speaker}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    );
}