"use client";

import React, {useRef, useState} from "react";
import {Add, Calendar, Clock, Trash, User, Edit2} from "iconsax-react";
import { toast } from "sonner";
import { X } from "lucide-react";
import {dayAccentColors} from "@/constant/days.config";
import {AgendaDay} from "@/types/common.type";


function parseDateOnly(value: string) {
    if (!value) return null;
    const cleanValue = value.split('T')[0];
    const parsed = new Date(`${cleanValue}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateLabel(value: string) {
    const parsed = parseDateOnly(value);
    if (!parsed) return value;

    return parsed.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

function parseTimeToMinutes(value: string) {
    if (!value) return null;

    const trimmed = String(value).trim();
    const ampmMatch = trimmed.match(/(AM|PM|am|pm)\s*$/);

    if (ampmMatch) {
        const parts = trimmed.replace(/(AM|PM|am|pm)\s*$/i, "").trim().split(":");
        if (parts.length < 2) return null;

        let hours = Number(parts[0]);
        const minutes = Number(parts[1]);

        if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

        const isPM = /PM|pm/.test(ampmMatch[0]);
        if (hours === 12) {
            hours = isPM ? 12 : 0;
        } else if (isPM) {
            hours += 12;
        }

        return hours * 60 + minutes;
    }

    const parts = trimmed.split(":");
    if (parts.length < 2) return null;

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

    return hours * 60 + minutes;
}

function formatDuration(start: string, end: string) {
    const startMinutes = parseTimeToMinutes(start);
    const endMinutes = parseTimeToMinutes(end);

    if (startMinutes === null || endMinutes === null) return "0s";

    const totalMinutes = endMinutes - startMinutes;
    if (totalMinutes <= 0) return "0s";

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (!hours) return `${minutes}m`;
    if (!minutes) return `${hours}h`;
    return `${hours}h ${minutes}m`;
}

export default function Step3Agenda({
                                        initialDays,
                                        onChangeAction,
                                        eventStartDate,
                                        eventEndDate,
                                    }: {
    initialDays?: AgendaDay[];
    onChangeAction?: (days: AgendaDay[]) => void;
    eventStartDate?: string;
    eventEndDate?: string;
}) {
    const [days, setDays] = useState<AgendaDay[]>(initialDays ?? []);
    const timeInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [modalError, setModalError] = useState("");
    const [touchedDesc, setTouchedDesc] = useState<Record<number, boolean>>({});
    const dateInputRef = useRef<HTMLInputElement | null>(null);

    const onChangeActionRef = useRef(onChangeAction);
    React.useEffect(() => {
        onChangeActionRef.current = onChangeAction;
    }, [onChangeAction]);

    const initialDaysJson = JSON.stringify(initialDays ?? []);
    const initialDaysRef = useRef(initialDaysJson);
    React.useEffect(() => {
        if (initialDaysRef.current !== initialDaysJson) {
            initialDaysRef.current = initialDaysJson;
            setDays(JSON.parse(initialDaysJson));
        }
    }, [initialDaysJson]);

    const notifyParent = React.useCallback((updatedDays: AgendaDay[]) => {
        onChangeActionRef.current?.(updatedDays);
    }, []);

    React.useEffect(() => {
        if (!isDateModalOpen) {
            setModalError("");
        }
    }, [isDateModalOpen]);

    const updateDay = <K extends keyof AgendaDay>(
        dayId: number,
        field: K,
        value: AgendaDay[K]
    ) => {
        const updated = days.map((day) =>
            day.id === dayId ? {...day, [field]: value} : day
        );
        setDays(updated);
        notifyParent(updated);
    };

    const removeDay = (dayId: number) => {
        const updated = days.filter((day) => day.id !== dayId);
        let currentDayLabelCount = 0;
        let lastDateValue = "";
        const finalDays = updated.map((day, index) => {
            if (day.dateValue !== lastDateValue) {
                currentDayLabelCount++;
                lastDateValue = day.dateValue ?? "";
            }
            return {
                ...day,
                dayLabel: `Day ${currentDayLabelCount} Session`,
                accentColor: dayAccentColors[(currentDayLabelCount - 1) % dayAccentColors.length],
            };
        });
        setDays(finalDays);
        notifyParent(finalDays);
    };

    const handleAddSessionToDay = (dateValue: string) => {
        const nextId = days.length ? Math.max(...days.map((d) => d.id)) + 1 : 1;
        const dateLabel = formatDateLabel(dateValue);
        const nextDays = [
            ...days,
            {
                id: nextId,
                dayLabel: "",
                dateValue,
                dateLabel,
                accentColor: "",
                start: "",
                end: "",
                speaker: "",
                description: "",
            }
        ].sort((a, b) => {
            const aTime = parseDateOnly(a.dateValue ?? "")?.getTime() ?? Number.MAX_SAFE_INTEGER;
            const bTime = parseDateOnly(b.dateValue ?? "")?.getTime() ?? Number.MAX_SAFE_INTEGER;
            return aTime - bTime;
        });

        let currentDayLabelCount = 0;
        let lastDateValue = "";
        const finalDays = nextDays.map((day) => {
            if (day.dateValue !== lastDateValue) {
                currentDayLabelCount++;
                lastDateValue = day.dateValue ?? "";
            }
            return {
                ...day,
                dayLabel: `Day ${currentDayLabelCount} Session`,
                accentColor: dayAccentColors[(currentDayLabelCount - 1) % dayAccentColors.length],
            };
        });

        setDays(finalDays);
        notifyParent(finalDays);
    };

    const handleEditDayDate = (oldDate: string, newDate: string) => {
        if (!newDate) return;
        if (!isSelectedDateValid(newDate)) {
            toast.error("Selected date must be within the event date range.");
            return;
        }

        const nextDays = days.map((day) => {
            if (day.dateValue === oldDate) {
                return {
                    ...day,
                    dateValue: newDate,
                    dateLabel: formatDateLabel(newDate)
                };
            }
            return day;
        });

        nextDays.sort((a, b) => {
            const aTime = parseDateOnly(a.dateValue ?? "")?.getTime() ?? Number.MAX_SAFE_INTEGER;
            const bTime = parseDateOnly(b.dateValue ?? "")?.getTime() ?? Number.MAX_SAFE_INTEGER;
            return aTime - bTime;
        });

        let currentDayLabelCount = 0;
        let lastDateValue = "";
        const finalDays = nextDays.map((day) => {
            if (day.dateValue !== lastDateValue) {
                currentDayLabelCount++;
                lastDateValue = day.dateValue ?? "";
            }
            return {
                ...day,
                dayLabel: `Day ${currentDayLabelCount} Session`,
                accentColor: dayAccentColors[(currentDayLabelCount - 1) % dayAccentColors.length],
            };
        });

        setDays(finalDays);
        notifyParent(finalDays);
    };

    const groupedDays = React.useMemo(() => {
        const groups: { dateValue: string; dateLabel: string; dayLabel: string; sessions: AgendaDay[]; accentColor: string }[] = [];
        let currentDayLabelCount = 0;
        let lastDateValue = "";
        
        days.forEach(day => {
            if (!day.dateValue) return;
            if (day.dateValue !== lastDateValue) {
                currentDayLabelCount++;
                lastDateValue = day.dateValue;
                groups.push({
                    dateValue: day.dateValue,
                    dateLabel: day.dateLabel || "",
                    dayLabel: `Day ${currentDayLabelCount}`,
                    accentColor: dayAccentColors[(currentDayLabelCount - 1) % dayAccentColors.length],
                    sessions: []
                });
            }
            groups[groups.length - 1].sessions.push(day);
        });
        return groups;
    }, [days]);

    const getToday = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const today = getToday();
    const eventStart = eventStartDate ? parseDateOnly(eventStartDate) : null;
    const eventEnd = eventEndDate ? parseDateOnly(eventEndDate) : null;
    const hasEventRange = Boolean(eventStart && eventEnd);

    const isSelectedDateValid = (value: string) => {
        const selected = parseDateOnly(value);
        if (!selected || !eventStart || !eventEnd) return false;
        return selected >= eventStart && selected <= eventEnd;
    };

    const openAddDayModal = () => {
        if (!hasEventRange) {
            setModalError("Please complete the event start and end dates first.");
            setIsDateModalOpen(true);
            return;
        }

        setSelectedDate("");
        setModalError("");
        setIsDateModalOpen(true);
    };

    const confirmSelectedDate = () => {
        if (!selectedDate) {
            setModalError("Please select a date.");
            return;
        }

        if (!hasEventRange) {
            setModalError("Please complete the event start and end dates first.");
            return;
        }

        if (!isSelectedDateValid(selectedDate)) {
            setModalError("Selected date must be within the event date range.");
            return;
        }

        const nextId = days.length
            ? Math.max(...days.map((day) => day.id)) + 1
            : 1;

        const nextDays = [
            ...days,
            {
                id: nextId,
                dayLabel: "",
                dateValue: selectedDate,
                dateLabel: formatDateLabel(selectedDate),
                accentColor: "",
                start: "",
                end: "",
                speaker: "",
                description: "",
            },
        ].sort((a, b) => {
            const aTime = parseDateOnly(a.dateValue ?? "")?.getTime() ?? Number.MAX_SAFE_INTEGER;
            const bTime = parseDateOnly(b.dateValue ?? "")?.getTime() ?? Number.MAX_SAFE_INTEGER;
            return aTime - bTime;
        });

        let currentDayLabelCount = 0;
        let lastDateValue = "";
        const finalDays = nextDays.map((day, index) => {
            if (day.dateValue !== lastDateValue) {
                currentDayLabelCount++;
                lastDateValue = day.dateValue ?? "";
            }
            return {
                ...day,
                dayLabel: `Day ${currentDayLabelCount} Session`,
                accentColor: dayAccentColors[(currentDayLabelCount - 1) % dayAccentColors.length],
            };
        });

        setDays(finalDays);
        notifyParent(finalDays);

        setIsDateModalOpen(false);
        setSelectedDate("");
        setModalError("");
    };

    const openTimePicker = (input: HTMLInputElement | null) => {
        if (!input) return;
        input.focus();
        if (typeof input.showPicker === "function") {
            input.showPicker();
            return;
        }
        input.click();
    };

    const openDatePicker = (input: HTMLInputElement | null) => {
        if (!input) return;
        input.focus();
        if (typeof input.showPicker === "function") {
            input.showPicker();
            return;
        }
        input.click();
    };

    return (
        <div className="relative flex flex-col gap-6">
            <div className="flex justify-end mb-2 md:mb-0 md:absolute md:-top-18 md:right-0">
                <button
                    type="button"
                    onClick={openAddDayModal}
                    disabled={!hasEventRange}
                    className="bg-main text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Add size={20} className="text-white" color="currentColor"/>
                    New Day
                </button>
            </div>

            <div className="flex flex-col gap-6">
                <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white p-6">
                    {days.length > 0 ? (
                        <div className={`flex flex-col gap-6 pr-2 ${days.length > 1 ? "h-90 overflow-y-auto" : ""}`}>
                            {groupedDays.map((group) => (
                                <div key={group.dateValue}
                                     className="w-full border border-(--input-border) rounded-2xl overflow-hidden flex flex-col shrink-0">
                                    <div className="bg-main px-4 py-2 flex justify-between items-center text-white">
                                        <span className="font-semibold text-[15px]">{group.dayLabel}</span>
                                        <div className="flex items-center gap-3">
                                            {!isSelectedDateValid(group.dateValue) && (
                                                <span className="text-rose-400 font-extrabold text-lg drop-shadow-sm flex items-center justify-center" title="Date is outside event range">
                                                    !
                                                </span>
                                            )}
                                            <label className="text-xs flex items-center gap-1.5 font-medium cursor-pointer hover:opacity-80 transition-opacity relative">
                                            <Calendar size={14} className="text-white" color="currentColor"/>
                                            {group.dateLabel}
                                            <Edit2 size={12} className="text-white ml-0.5" />
                                            <input 
                                                type="date"
                                                value={group.dateValue}
                                                min={eventStart ? `${eventStart.getFullYear()}-${String(eventStart.getMonth() + 1).padStart(2, "0")}-${String(eventStart.getDate()).padStart(2, "0")}` : undefined}
                                                max={eventEndDate}
                                                onChange={(e) => handleEditDayDate(group.dateValue, e.target.value)}
                                                onClick={(e) => {
                                                    // Trigger native date picker for inputs that support showPicker
                                                    if ('showPicker' in HTMLInputElement.prototype) {
                                                        e.preventDefault();
                                                        (e.target as HTMLInputElement).showPicker();
                                                    }
                                                }}
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                            />
                                            </label>
                                        </div>
                                    </div>
                                    
                                    {group.sessions.map((day, sessionIndex) => {
                                        const previousSession = sessionIndex > 0 ? group.sessions[sessionIndex - 1] : null;
                                        const isStartTimeInvalid = previousSession && day.start && previousSession.end && day.start < previousSession.end;
                                        
                                        return (
                                        <div key={day.id} className="flex flex-col bg-white relative border-b border-[#eaecf0] last:border-b-0">
                                            <div className="px-5 pt-4 pb-0 flex items-center justify-between">
                                                <span className="text-[13px] font-bold text-main">Session {sessionIndex + 1}</span>
                                            </div>
                                            <div className="flex items-stretch">
                                                <div className="w-1.5 shrink-0 my-4 rounded-r-md"
                                                     style={{backgroundColor: sessionIndex % 2 === 0 ? "var(--main-color)" : group.accentColor}}/>
                                                <div
                                                    className="p-4 flex w-full min-w-0 flex-col gap-4 xl:flex-row xl:items-start">
                                                    <div className="flex w-full flex-col gap-4 xl:w-40 xl:shrink-0">
                                                        <div className="flex flex-col gap-1.5">
                                                            <label className="text-[10px] text-des font-semibold"
                                                                   htmlFor={`start-${day.id}`}>
                                                                Start
                                                            </label>
                                                            <div
                                                                className={`border rounded-md px-3 h-10.5 flex items-center gap-2 text-des focus-within:border-main-color overflow-hidden ${!day.start || isStartTimeInvalid ? "border-rose-400 focus-within:border-rose-500" : "border-(--input-border)"}`}>
                                                                <button
                                                                type="button"
                                                                onClick={() => openTimePicker(timeInputRefs.current[`start-${day.id}`])}
                                                                className="shrink-0 rounded-full p-1 text-main-color hover:bg-main/10 transition-colors cursor-pointer"
                                                            >
                                                                <Clock size={24} className="shrink-0" color="currentColor"/>
                                                            </button>
                                                            <input
                                                                id={`start-${day.id}`}
                                                                type="time"
                                                                min={previousSession?.end || undefined}
                                                                value={day.start}
                                                                onChange={(event) => updateDay(day.id, "start", event.target.value)}
                                                                ref={(element) => {
                                                                    timeInputRefs.current[`start-${day.id}`] = element;
                                                                }}
                                                                className="agenda-time-input min-w-0 flex-1 bg-transparent outline-none text-xs font-medium tracking-normal text-des"
                                                            />
                                                        </div>
                                                        {!day.start ? (
                                                            <span className="text-[10px] text-rose-500 font-medium">Start time is required.</span>
                                                        ) : isStartTimeInvalid ? (
                                                            <span className="text-[10px] text-rose-500 font-medium">Must be after previous end time.</span>
                                                        ) : null}
                                                    </div>
    
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-[10px] text-des font-semibold"
                                                               htmlFor={`end-${day.id}`}>
                                                            End
                                                        </label>
                                                        <div
                                                            className={`border rounded-md px-3 h-10.5 flex items-center gap-2 text-des focus-within:border-main-color overflow-hidden ${!day.end || (day.start && day.end && day.end <= day.start) ? "border-rose-400 focus-within:border-rose-500" : "border-(--input-border)"}`}>
                                                            <button
                                                                type="button"
                                                                onClick={() => openTimePicker(timeInputRefs.current[`end-${day.id}`])}
                                                                className="shrink-0 rounded-full p-1 text-main-color hover:bg-main/10 transition-colors cursor-pointer"
                                                            >
                                                                <Clock size={24} className="shrink-0" color="currentColor"/>
                                                            </button>
                                                            <input
                                                                id={`end-${day.id}`}
                                                                type="time"
                                                                min={day.start || previousSession?.end || undefined}
                                                                value={day.end}
                                                                onChange={(event) => updateDay(day.id, "end", event.target.value)}
                                                                ref={(element) => {
                                                                    timeInputRefs.current[`end-${day.id}`] = element;
                                                                }}
                                                                className="agenda-time-input min-w-0 flex-1 bg-transparent outline-none text-xs font-medium tracking-normal text-des"
                                                            />
                                                        </div>
                                                        {!day.end ? (
                                                            <span className="text-[10px] text-rose-500 font-medium">End time is required.</span>
                                                        ) : day.start && day.end <= day.start ? (
                                                            <span className="text-[10px] text-rose-500 font-medium">End time must be after start time.</span>
                                                        ) : null}
                                                    </div>
                                                </div>
    
                                                <div
                                                    className="flex w-full min-w-0 flex-col gap-4 border-[#eaecf0] xl:flex-1 xl:border-r xl:pr-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-[10px] text-des font-semibold"
                                                               htmlFor={`speaker-${day.id}`}>
                                                            Speaker (Optional)
                                                        </label>
                                                        <div
                                                            className="border border-(--input-border) rounded-md px-3 h-10.5 flex items-center gap-2 text-des focus-within:border-main-color">
                                                            <User size={20} className="main-color shrink-0"
                                                                  color="currentColor"/>
                                                            <input
                                                                id={`speaker-${day.id}`}
                                                                type="text"
                                                                maxLength={50}
                                                                value={day.speaker}
                                                                onChange={(event) => updateDay(day.id, "speaker", event.target.value)}
                                                                placeholder="speaker"
                                                                className="w-full bg-transparent outline-none text-xs font-medium text-des placeholder:text-[#94a3b8]"
                                                            />
                                                        </div>
                                                    </div>
    
                                                    <div className="flex flex-col gap-1.5 w-full">
                                                        <label className="text-[10px] text-des font-semibold"
                                                               htmlFor={`description-${day.id}`}>
                                                            Description
                                                        </label>
                                                        <textarea
                                                            id={`description-${day.id}`}
                                                            rows={3}
                                                            maxLength={300}
                                                            value={day.description}
                                                            onChange={(event) => updateDay(day.id, "description", event.target.value)}
                                                            placeholder="Brief description..."
                                                            className={`border rounded-md px-3 py-2 text-xs text-des w-full resize-none outline-none min-h-[4.5rem] ${touchedDesc[day.id] && !day.description ? "border-rose-400 focus:border-rose-500" : "border-(--input-border) focus:border-main-color"}`}
                                                            onBlur={() => setTouchedDesc(prev => ({ ...prev, [day.id]: true }))}
                                                        />
                                                        <div className="flex justify-between items-start px-1 mt-0.5">
                                                            {touchedDesc[day.id] && !day.description ? (
                                                                <span className="text-[10px] text-rose-500 font-medium leading-tight">Description is required.</span>
                                                            ) : <span />}
                                                            <p className="text-[10px] text-[#94a3b8] leading-tight shrink-0 ml-2">
                                                                {day.description.length}/300
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
    
                                                <div
                                                    className="flex w-full flex-col gap-2 items-center justify-center xl:w-15 xl:shrink-0 pt-1">
                                                    <label
                                                        className="text-[10px] text-des font-semibold text-center w-full">
                                                        Duration
                                                    </label>
                                                    <div
                                                        className="flex items-center gap-1 text-[13px] font-bold secondary-color mb-3">
                                                        {formatDuration(day.start, day.end)}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeDay(day.id)}
                                                        className="text-accent-color hover:bg-accent-color/10 p-2 rounded-full transition-colors mt-auto cursor-pointer"
                                                    >
                                                        <Trash size={20} className="accent-color" color="red"/>
                                                    </button>
                                                </div>
                                            </div>
                                            </div>
                                        </div>
                                        );
                                    })}
                                    
                                    <div className="bg-[#f8fafc] p-3 flex justify-center border-t border-[#eaecf0]">
                                        <button 
                                            type="button" 
                                            onClick={() => handleAddSessionToDay(group.dateValue)} 
                                            className="text-sm font-semibold text-main flex items-center gap-1 hover:text-main-color transition-colors cursor-pointer"
                                        >
                                            <Add size={18} color="currentColor" />
                                            Add Session
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div
                            className="flex h-90 items-center justify-center text-center text-sm font-medium text-[#94a3b8]">
                            No agenda days yet. Add one to continue.
                        </div>
                    )}
                </div>
            </div>

            {isDateModalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200"
                    style={{zIndex: 99999}}
                    onClick={() => setIsDateModalOpen(false)}
                >
                    <div
                        className="relative w-full max-w-md rounded-3xl bg-white px-8 py-8 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-300"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setIsDateModalOpen(false)}
                            className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--main-color)/10 text-(--main-color)">
                                <Calendar size={26} color="currentColor"/>
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-(--secondary-color)">Select date</h3>
                            <p className="mt-2 text-sm text-[#7886a6]">Please select new day for agenda</p>
                        </div>

                        <div className="mt-8">
                            <div className="relative">
                                <input
                                    ref={dateInputRef}
                                    type="date"
                                    value={selectedDate}
                                    min={eventStart ? `${eventStart.getFullYear()}-${String(eventStart.getMonth() + 1).padStart(2, "0")}-${String(eventStart.getDate()).padStart(2, "0")}` : undefined}
                                    max={eventEndDate}
                                    onChange={(event) => {
                                        setSelectedDate(event.target.value);
                                        setModalError("");
                                    }}
                                    className="agenda-date-input w-full h-12 rounded-xl border border-(--input-border) bg-white px-4 pr-12 text-sm text-des outline-none focus:border-main-color [&::-webkit-calendar-picker-indicator]:hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => openDatePicker(dateInputRef.current)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-des cursor-pointer"
                                >
                                    <Calendar size={18} color="currentColor"/>
                                </button>
                            </div>

                            {modalError && (
                                <p className="mt-3 text-sm font-medium text-red-500">{modalError}</p>
                            )}

                            <div className="mt-8 flex justify-center">
                                <button
                                    type="button"
                                    onClick={confirmSelectedDate}
                                    className="min-w-28 rounded-xl bg-(--main-color) px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .agenda-time-input {
                    appearance: none;
                    -webkit-appearance: none;
                    min-width: 0;
                }

                .agenda-time-input::-webkit-calendar-picker-indicator {
                    display: none !important;
                }

                .agenda-date-input::-webkit-calendar-picker-indicator {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
