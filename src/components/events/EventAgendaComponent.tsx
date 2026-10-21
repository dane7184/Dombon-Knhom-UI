// components/events/EventAgendaComponent.tsx
import React from "react";
import "@/app/globals.css";
import { Clock, NoteText, User } from "iconsax-react";
import { Agenda } from "@/types/event.type";

interface EventAgendaComponentProps {
  agenda: Agenda;
}

const calculateDuration = (start: string, end: string): string => {
  const parseTimeToMinutes = (timeStr: string): number => {
    const cleaned = timeStr.toUpperCase().trim();
    const isPM = cleaned.includes("PM");
    const isAM = cleaned.includes("AM");

    // Extract numbers
    const match = cleaned.match(/(\d+):(\d+)/);
    if (!match) return 0;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const startMin = parseTimeToMinutes(start);
  const endMin = parseTimeToMinutes(end);
  let diff = endMin - startMin;

  if (diff < 0) diff += 24 * 60;

  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;

  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
};

export const EventAgendaComponent = ({ agenda }: EventAgendaComponentProps) => {
  const agendaDays = Object.entries(agenda).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  if (agendaDays.length === 0) return null;

  return (
    <div className="w-full p-5 bg-white rounded-2xl box-shadow flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4.5 px-1">
        <h3 className="text-xl font-bold text-(--secondary-color) tracking-tight">
          Event Agenda
        </h3>
        <span className="text-xs font-semibold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full">
          {agendaDays.length} {agendaDays.length === 1 ? "Day" : "Days"}
        </span>
      </div>

      <div className="flex flex-col gap-6 mb-2">
        {agendaDays.map(([date, items], dayIndex) => (
          <div key={date} className="flex flex-col gap-4">
            {/* Elegant Day Pill Header */}
            <div className="inline-flex ml-1 items-center gap-2 self-start bg-slate-50 border border-slate-200/60 rounded-full px-2 py-1.5 shadow-xs">
              <span className="text-sm font-bold text-white bg-(--main-color) px-2 py-0.5 rounded-full uppercase tracking-wider">
                Day {dayIndex + 1}
              </span>
              <span className="text-md font-semibold text-(--secondary-color) pr-2">
                {date}
              </span>
            </div>

            {/* Timeline Row Group */}
            <div className="relative pl-6 border-l-2 border-slate-100 ml-4 mr-2 flex flex-col gap-4">
              {items
                .sort((a, b) => a.order - b.order)
                .map((item) => {
                  const duration = calculateDuration(
                    item.startTime,
                    item.endTime,
                  );

                  return (
                    <div
                      key={item.order}
                      className="relative group bg-white border border-slate-100 p-4 rounded-xl transition-all duration-200 flex flex-col md:flex-row md:items-center gap-4 justify-between shadow-sm"
                    >
                      {/* Timeline Node Dot Effect */}
                      <div className="absolute -left-8 top-6 w-3 h-3 rounded-full bg-slate-300 border-2 border-white group-hover:bg-(--main-color) transition-colors" />

                      {/* Time Details Column */}
                      <div className="flex flex-col gap-1 md:w-[25%] shrink-0">
                        <div className="flex items-center gap-3 text-slate-700">
                          <Clock
                            size="22"
                            color="var(--main-color)"
                            variant="Linear"
                            className="shrink-0"
                          />
                          <div>
                            <span className="text-xs font-medium text-slate-400">
                              Duration: {duration}
                            </span>
                            <p className="text-md font-bold tracking-tight">
                              {item.startTime} – {item.endTime}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Agenda Subject / Description Column */}
                      <div className="flex items-center gap-3 md:w-[45%] min-w-0">
                        <NoteText
                          size="22"
                          color="var(--main-color)"
                          variant="Linear"
                          className="shrink-0 mt-0.5"
                        />
                        {/* Added w-full and min-w-0 here */}
                        <div className="flex flex-col w-full min-w-0">
                          <span className="text-xs font-medium text-slate-400">
                            Description
                          </span>
                          {/* Swapped break-all to break-words for cleaner reading */}
                          <p className="text-[14px] font-semibold text-(--secondary-color) leading-relaxed wrap-break-words">
                            {item.description || "No description"}
                          </p>
                        </div>
                      </div>

                      {/* Speaker Profile Column */}
                      {/* <div className="flex items-center gap-3 md:w-[25%] bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg self-start md:self-auto transition-colors"> */}
                      <div className="flex items-center gap-3 md:w-[25%] min-w-0">
                        <User
                          size="22"
                          color="var(--main-color)"
                          variant="Linear"
                          className="shrink-0"
                        />
                        {/* Added w-full and min-w-0 here */}
                        <div className="flex flex-col w-full min-w-0">
                          <span className="text-xs font-medium text-slate-400">
                            Speaker
                          </span>
                          {/* Removed truncate, changed to break-words */}
                          <p className="text-[14px] font-semibold text-(--secondary-color) leading-relaxed wrap-break-words">
                            {item.speakerName || "No speaker"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
