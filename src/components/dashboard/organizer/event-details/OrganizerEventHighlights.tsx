import {OrganizerEventDetail} from "@/types/organizer.type";

export default function OrganizerEventHighlights({ event }: { event: OrganizerEventDetail }) {
    return (
        <section className="rounded-[24px] bg-white p-5 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold secondary-color mb-4">Event Notes</h2>
            <div className="grid gap-3 sm:grid-cols-3">
                {event.highlights.map((highlight) => (
                    <div key={highlight} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                        {highlight}
                    </div>
                ))}
            </div>
        </section>
    );
}