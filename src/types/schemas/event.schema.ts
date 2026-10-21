import { z } from "zod";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const parseDateOnly = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(`${value}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseTimeToMinutes = (value?: string) => {
    if (!value) return null;
    const parts = value.split(":");
    if (parts.length < 2) return null;
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
};

export const eventStep1Schema = z
    .object({
        title: z
            .string()
            .trim()
            .min(10, "Title must be at least 10 characters.")
            .max(100, "Title cannot exceed 100 characters."),
        category: z.string().trim().min(1, "Category is required."),
        capacity: z.union([z.number().int().min(0, "Capacity cannot be negative.").max(100000, "Capacity cannot exceed 100,000."), z.literal("")]).optional(),
        startDate: z.string().min(1, "Start date is required."),
        endDate: z.string().min(1, "End date is required."),
        description: z.string().min(1, "Description is required.").max(1000, "Description cannot exceed 1000 characters."),
    })
    .refine(
        (data) => {
            const start = parseDateOnly(data.startDate);
            const end = parseDateOnly(data.endDate);
            return start !== null && end !== null && end >= start;
        },
        { message: "End date must be on or after the start date.", path: ["endDate"] }
    )
    .refine(
        (data) => {
            const start = parseDateOnly(data.startDate);
            if (!start) return true;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return start > today;
        },
        { message: "Start date must be from tomorrow onwards.", path: ["startDate"] }
    );

export type EventStep1Input = z.infer<typeof eventStep1Schema>;

export const eventStep2Schema = z.object({
    image: z.string().min(1, "Cover image is required."),
});

export type EventStep2Input = z.infer<typeof eventStep2Schema>;

export const eventLocationSchema = z.object({
    province: z.string().min(1, "Province is required."),
    district: z
        .string()
        .trim()
        .min(3, "District must be at least 3 characters.")
        .max(100, "District cannot exceed 100 characters."),
    commune: z
        .string()
        .trim()
        .min(3, "Commune must be at least 3 characters.")
        .max(150, "Commune cannot exceed 150 characters."),
    specificAddr: z
        .string()
        .trim()
        .min(10, "Specific address must be at least 10 characters.")
        .max(255, "Specific address cannot exceed 255 characters."),
    pin: z
        .object({
            lat: z.number().min(-90).max(90),
            lng: z.number().min(-180).max(180),
        })
        .nullable()
        .optional(),
});

export type EventLocationInput = z.infer<typeof eventLocationSchema>;

export const organizerPinSchema = z
    .object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })
    .nullable()
    .refine((pin) => pin !== null, "Please drop a pin on the map for your venue location.");

export const eventSessionSchema = z.object({
    dateValue: z.string().min(1, "Date is required."),
    start: z.string().regex(TIME_PATTERN, "Start time must be in HH:MM format."),
    end: z.string().regex(TIME_PATTERN, "End time must be in HH:MM format."),
    speaker: z.string().optional(),
    description: z.string().min(1, "Agenda description is required.").max(500, "Agenda description cannot exceed 500 characters."),
});

export type EventSessionInput = z.infer<typeof eventSessionSchema>;

export function createAgendaSchema(eventStartDate?: string, eventEndDate?: string) {
    const rangeStart = parseDateOnly(eventStartDate);
    const rangeEnd = parseDateOnly(eventEndDate);

    return z
        .array(eventSessionSchema)
        .min(1, "Agenda must have at least one session.")
        .superRefine((days, ctx) => {
            const dateGroups: Record<string, typeof days> = {};
            days.forEach((day) => {
                if (!dateGroups[day.dateValue]) dateGroups[day.dateValue] = [];
                dateGroups[day.dateValue].push(day);
            });

            days.forEach((day, idx) => {
                const startMinutes = parseTimeToMinutes(day.start);
                const endMinutes = parseTimeToMinutes(day.end);
                if (startMinutes !== null && endMinutes !== null && endMinutes <= startMinutes) {
                    ctx.addIssue({ code: "custom", message: `Session end time must be after start time.`, path: [idx, "end"] });
                }

                const dayDate = parseDateOnly(day.dateValue);
                if (dayDate && rangeStart && rangeEnd && (dayDate < rangeStart || dayDate > rangeEnd)) {
                    ctx.addIssue({ code: "custom", message: `Session date must be within the event's date range.`, path: [idx, "dateValue"] });
                }
                
                const group = dateGroups[day.dateValue];
                const groupIndex = group.indexOf(day);
                if (groupIndex > 0) {
                    const prevSession = group[groupIndex - 1];
                    const currentStartMinutes = parseTimeToMinutes(day.start);
                    const prevEndMinutes = parseTimeToMinutes(prevSession.end);
                    
                    if (currentStartMinutes !== null && prevEndMinutes !== null && currentStartMinutes < prevEndMinutes) {
                        ctx.addIssue({ code: "custom", message: `Must be after previous session end time.`, path: [idx, "start"] });
                    }
                }
            });
        });
}
