export type EventStatus = "Approved" | "Rejected" | "Pending";

export type ReportReason = "Spam" | "Fake Event" | "Inappropriate" | "Other";

export interface Report {
  id: string;
  reporterBy: string;
  reason: string;
  description: string;
  reportedOn: string;
}

export interface AgendaItem {
  start: string;
  end: string;
  speaker: string;
  description: string;
  duration: string;
}

export interface AgendaDay {
  day: number;
  date: string; 
  items: AgendaItem[];
}

export interface ReportSummary {
  postBy: string;
  eventDate: string;
  province: string;
  capacity: number;
  price: string;
  status: EventStatus;
}

// Content shown in the "Event Details" tab of the event report page. Distinct
// from EventReportDetail (admin.type.ts), which is the full composed report
// view model, and from EventDetail (event.type.ts), the public event page model.
export interface EventReportTabDetail {
  title: string;
  description: string;
  hashtags: string[];
  agenda: AgendaDay[];
  reportSummary: ReportSummary;
}
