import Image from "next/image";
import { MessageCircle, Reply } from "lucide-react";

import {OrganizerEventDetail} from "@/types/organizer.type";

export default function OrganizerEventComments({ event }: { event: OrganizerEventDetail }) {
    return (
        <section className="rounded-[24px] bg-white p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-lg font-bold secondary-color">Comments</h2>
                    <p className="text-sm text-slate-500">{event.comments.length}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm text-slate-500 border border-slate-100">
                    <MessageCircle size={16} className="text-(--main-color)" />
                    Add a comment...
                </div>
            </div>

            <div className="space-y-4">
                {event.comments.map((comment) => (
                    <div key={comment.id} className="space-y-3">
                        <div className="flex gap-3">
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
                                <Image src={comment.avatar} alt={comment.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-sm font-semibold secondary-color">
                                    {comment.name}
                                    <span className="text-xs font-normal text-slate-400">{comment.time}</span>
                                </div>
                                <div className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-600">
                                    {comment.content}
                                </div>
                                <button className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                                    <Reply size={12} />
                                    Reply
                                </button>
                            </div>
                        </div>

                        {comment.replies.length > 0 && (
                            <div className="ml-11 space-y-3 border-l border-slate-100 pl-4">
                                {comment.replies.map((reply) => (
                                    <div key={reply.id} className="flex gap-3">
                                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-100">
                                            <Image src={reply.avatar} alt={reply.name} fill className="object-cover" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-xs font-semibold secondary-color">
                                                {reply.name}
                                                <span className="font-normal text-slate-400">{reply.time}</span>
                                            </div>
                                            <div className="mt-1 inline-block rounded-full bg-[#dcf2f6] px-3 py-2 text-sm text-slate-700">
                                                {reply.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 text-center text-sm text-slate-500">View all comments</div>
        </section>
    );
}