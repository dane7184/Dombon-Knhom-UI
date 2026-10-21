export type ReportReason =
  | "Spam"
  | "Fake Event"
  | "Inappropriate"
  | "Violence"
  | "Harassment";

export interface ActivityReport {
  id: number;
  reporterBy: string;
  reason: ReportReason;
  description: string;
  reportedOn: string;
}