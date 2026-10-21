// components/events/EventDetail.tsx
"use client";
import React from "react";
import { EventContent } from "./EventContent";
import { UserPostEvent } from "./UserPostEvent";
import { EventDateComponent } from "./EventDateComponent";
import { EventLocationComponent } from "./EventLocationComponent";
import { EventRateComponent } from "./EventRateCommponent";
import { EventAgendaComponent } from "./EventAgendaComponent";
import { CommentComponent } from "./CommentComponent";
import { ReviewComponent } from "./ReviewComponent";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  EventDetail as EventDetailType,
  EventCommentComponent,
  OrgProfile,
  UserProfile,
} from "@/types/event.type";
import { MeData } from "@/types/auth.types";

interface EventDetailProps {
  event: EventDetailType;
  comment: EventCommentComponent;
  compact?: boolean;
  rightExtra?: React.ReactNode;
  hideBackButton?: boolean;
  profile: OrgProfile | UserProfile | null;
  me: MeData | null;
  maxWidthClass?: string;
  showExportBtn?: boolean;
  isOrganizerView?: boolean;
}

export default function EventDetail({
  event,
  comment,
  compact,
  rightExtra,
  hideBackButton,
  profile,
  me,
  maxWidthClass = "max-w-full",
  showExportBtn,
  isOrganizerView = false,
}: EventDetailProps) {
  return (
    <div className={`w-full ${maxWidthClass} mx-auto flex flex-col gap-4`}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="contents md:flex md:flex-col md:w-[65%] md:min-w-0 md:gap-4">
          <div className="order-3 md:order-0">
            <EventContent event={event} hideBackButton={hideBackButton} />
          </div>
          <div className="order-4 md:order-0">
            <CommentComponent comment={comment} event={event} me={me} />
          </div>
          <div className="order-6 md:order-0">
            <EventAgendaComponent agenda={event.agenda} />
          </div>
        </div>
        <div className="contents md:flex md:flex-col md:w-[35%] md:h-full md:min-w-0 md:gap-4">
          <div className="order-1 md:order-0">
            <UserPostEvent
              event={event}
              profile={profile}
              showBackButton={!hideBackButton}
            />
          </div>
          <div className="order-2 md:order-0">
            <EventDateComponent
              event={event}
              me={me}
              showExportBtn={showExportBtn}
              isOrganizerView={isOrganizerView}
            />
          </div>
          <div className="order-5 md:order-0">
            <EventLocationComponent event={event} />
          </div>
          <div className="order-7 md:order-0">
            <EventRateComponent event={event} />
          </div>
          {rightExtra && <div className="order-8 md:order-0">{rightExtra}</div>}
        </div>
      </div>
      <ReviewComponent event={event} />
    </div>
  );
}
