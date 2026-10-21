import { EventReportTabDetail } from "@/types/eventReport.type";
import ReportSummaryCard from "@/components/dashboard/system-admin/EventReportDetailSummary";
import { EventAgendaComponent } from "@/components/events/EventAgendaComponent";
import { Agenda } from "@/types/event.type";

type ReportStatus = "Pending" | "Approved" | "Rejected";

interface EventDetailsTabProps {
  detail: EventReportTabDetail;
  currentStatus?: ReportStatus;
}

export default function EventDetailsTab({ detail, currentStatus }: EventDetailsTabProps) {
  const agenda: Agenda = Object.fromEntries(
    detail.agenda.map((day) => [
      day.date,
      day.items.map((item, index) => ({
        order: index + 1,
        startTime: item.start,
        endTime: item.end,
        speakerName: item.speaker,
        description: item.description,
      })),
    ]),
  );

  return (
    <div className="space-y-4">
      {/* Top: Event Info + Report Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left — Event Details */}
        <div>
          <h3 className="font-semibold text-(--secondary-color) text-base mb-4">
            Event Details
          </h3>

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Title
          </p>
          <p className="text-(--secondary-color) font-medium mb-4">{detail.title}</p>

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Description
          </p>
          <p className="text-(--text-secondary) text-sm leading-relaxed mb-3">
            {detail.description}
          </p>

          {/* hashtags */}
          <div className="flex flex-wrap gap-1">
            {detail.hashtags.map((tag) => (
              <span key={tag} className="text-(--main-color) text-sm hover:underline cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* reports summary*/}
        <div>
          <ReportSummaryCard summary={detail.reportSummary} currentStatus={currentStatus} />
        </div>
      </div>

      {/* agenda*/}
      <EventAgendaComponent agenda={agenda} />
    </div>
  );
}