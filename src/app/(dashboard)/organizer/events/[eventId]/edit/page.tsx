"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { switchToUserAction, switchToOrgAction } from "@/actions/auth.actions";
import {
    ArrowLeft2,
    Calendar,
    Gallery,
    Clock,
    Location,
    ArrowRight,
    ArrowLeft,
} from "iconsax-react";

import Step1BasicInfo, {
    type Step1Data,
} from "@/components/dashboard/organizer/FirstStep";

import Step2ImagePrice from "@/components/dashboard/organizer/SecondStep";
import Step3Agenda from "@/components/dashboard/organizer/FourthStep";
import Step4Location from "@/components/dashboard/organizer/ThirdStep";

import { toast } from "sonner";
import Toast from "@/components/modals/Toast";
import { fetchCategories } from "@/services/category.service";
import { fetchEventDetails } from "@/services/event.service";
import { useEventForm } from "@/hooks/useEventForm";
import {
    Stepper,
    StepperContent,
    StepperIndicator,
    StepperItem,
    StepperNav,
    StepperPanel,
    StepperTrigger,
} from "@/components/ui/stepper";
import {AgendaDay} from "@/types/common.type";

const steps = [
    {
        id: 1,
        title: "Basic Information",
        subtitle: "STEP 1",
        icon: Calendar,
    },
    {
        id: 2,
        title: "Image",
        subtitle: "STEP 2",
        icon: Gallery,
    },
    {
        id: 3,
        title: "Location",
        subtitle: "STEP 3",
        icon: Location,
    },
    {
        id: 4,
        title: "Agenda",
        subtitle: "STEP 4",
        icon: Clock,
    },
];

export default function Page({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = React.use(params);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { data: session, update } = useSession();
    const [, startTransition] = useTransition();

    const {
        currentStep, setCurrentStep,
        step1Data, setStep1Data,
        step2Data, setStep2Data,
        step3Data, setStep3Data,
        step4Data, setStep4Data,
        nextStep, prevStep,
        isCurrentStepValid,
        getStep4Errors,
        handleSubmit
    } = useEventForm({
        isOrganizer: true,
        orgId: session?.user?.orgId,
        sessionToken: session?.user?.accessToken,
        updateSession: update,
        eventId: String(eventId),
        onSuccess: () => {
            router.refresh();
            startTransition(() => {
                router.push("/organizer/events");
            });
        },
    });

    React.useEffect(() => {
        const loadEvent = async () => {
            try {
                const data = await fetchEventDetails(String(eventId));

                let categoryName = "Other";
                if (data.categoryId) {
                    try {
                        const cats = await fetchCategories({ page: 1, size: 100 });
                        const match = cats.find((c) => c.categoryId === data.categoryId);
                        if (match?.name) categoryName = match.name;
                    } catch {}
                }

                setStep1Data({
                    title: data.title || data.eventName,
                    category: categoryName,
                    description: data.description,
                    startDate: data.startAt ? data.startAt.split(/[T ]/)[0] : "",
                    endDate: data.endAt ? data.endAt.split(/[T ]/)[0] : "",
                    capacity: !data.capacity || data.capacity === "unlimited" ? "" : data.capacity
                });

                setStep2Data({
                    price: data.price,
                    image: data.cover
                });

                const mappedAgenda: AgendaDay[] = [];
                if (data.agenda) {
                    let dayIndex = 1;

                    type AgendaItem = { date?: string; dateValue?: string; startAt?: string; startTime?: string; start?: string; endTime?: string; end?: string; speakerName?: string; speaker?: string; description?: string; _fallbackDate?: string };
                    const agendaItems: AgendaItem[] = [];
                    if (Array.isArray(data.agenda)) {
                        const seenDates = new Set();
                        for (const item of data.agenda) {
                            const dateKey = (item.date as string) || (item.dateValue as string) || (item.startAt ? (item.startAt as string).split(/[T ]/)[0] : "");
                            if (dateKey && !seenDates.has(dateKey)) {
                                seenDates.add(dateKey);
                                agendaItems.push(item as AgendaItem);
                            }
                        }
                    } else {
                        Object.keys(data.agenda as Record<string, AgendaItem | AgendaItem[]>).forEach(dateKey => {
                            const val = (data.agenda as Record<string, AgendaItem | AgendaItem[]>)[dateKey];
                            const item = Array.isArray(val) ? val[0] : val;
                            agendaItems.push({ ...(item as AgendaItem), _fallbackDate: dateKey });
                        });
                    }

                    for (const item of agendaItems) {
                        const rawDate = (item.date as string) || (item.dateValue as string) || (item._fallbackDate as string) || "";
                        const parsedDate = new Date(rawDate);
                        const dateLabel = isNaN(parsedDate.getTime()) ? rawDate : parsedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                        let cleanDateValue = rawDate;
                        if (!isNaN(parsedDate.getTime())) {
                            cleanDateValue = parsedDate.toISOString().split("T")[0];
                        } else if (rawDate.includes("T")) {
                            cleanDateValue = rawDate.split("T")[0];
                        }

                        let cleanStart = String(item.startTime || item.start || "08:00");
                        let cleanEnd = String(item.endTime || item.end || "12:00");
                        if (cleanStart.length > 5 && cleanStart.includes(":")) cleanStart = cleanStart.substring(0, 5);
                        if (cleanEnd.length > 5 && cleanEnd.includes(":")) cleanEnd = cleanEnd.substring(0, 5);

                        mappedAgenda.push({
                            id: Math.random(),
                            dateValue: cleanDateValue,
                            dayLabel: `Day ${dayIndex}`,
                            dateLabel: dateLabel,
                            accentColor: dayIndex % 2 === 0 ? "#d946ef" : "#22c55e",
                            start: cleanStart,
                            end: cleanEnd,
                            speaker: String(item.speakerName || item.speaker || "General Speaker"),
                            description: String(item.description || "")
                        });
                        dayIndex++;
                    }
                }
                setStep3Data(mappedAgenda);

                let addressParts: string[] = [];
                let specAddr: string = "";
                let d: string = data.district || "";
                let c: string = data.commune || "";

                if (data.address) {
                    if (typeof data.address === 'string') {
                        addressParts = data.address.split(",").map((s: string) => s.trim());
                        if (!d) d = addressParts[1] || "";
                        if (!c) c = addressParts[2] || "";
                        specAddr = addressParts.slice(3).join(", ") || "";
                    } else if (typeof data.address === 'object') {
                        if (!d) d = data.address.district || "";
                        if (!c) c = data.address.commune || "";
                        specAddr = data.address.specificAddr || "";
                    }
                }

                const p = (data.province || addressParts[0] || "").replace(/_/g, ' ');
                d = d.replace(/_/g, ' ');
                c = c.replace(/_/g, ' ');

                setStep4Data({
                    province: p,
                    district: d,
                    commune: c,
                    specificAddr: specAddr,
                    pin: data.latitude && data.longitude ? { lat: data.latitude, lng: data.longitude } : null
                });

                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        loadEvent();
    }, [eventId]);

    const progressHeight = ((currentStep - 1) / (steps.length - 1)) * 100;

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="bg-white rounded-2xl card-shadow w-full h-auto lg:h-198 p-5 sm:p-8 lg:py-10 lg:pr-30 lg:pl-10 flex flex-col">
                <div className="mb-2 lg:pl-20">
                    <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-main font-medium mb-4 cursor-pointer hover:text-(--main-color)! transition-colors bg-transparent border-none p-0 outline-none">
                        <ArrowLeft size={18} color="currentColor" />
                        Back
                    </button>

                    <h1 className="text-3xl font-extrabold secondary-color mb-1">Edit Event</h1>

                    <p className="text-sm text-des">Follow the 4 steps to complete your event creation</p>
                </div>

                <Stepper value={currentStep} onValueChange={setCurrentStep} orientation="vertical" className="flex-1 flex flex-col lg:flex-row gap-12 mt-4 border-t border-[#f3f3f3] pt-2">
                    <StepperNav className="hidden lg:flex flex-col relative w-75 shrink-0 gap-18 h-fit self-start">
                        <div className="absolute right-18 top-0 bottom-0 w-0.5 bg-[#e2e8f0] z-0">
                            <div className="w-full bg-main transition-all duration-500 ease-in-out" style={{ height: `${progressHeight}%` }} />
                        </div>

                        <div className="absolute right-2 top-0 bottom-0 w-0.5 bg-[#e2e8f0] z-0">
                            <div className="w-full bg-main transition-all duration-500 ease-in-out" style={{ height: `${progressHeight}%` }} />
                        </div>

                        {steps.map((step) => (
                            <StepperItem key={step.id} step={step.id} className="group relative w-full">
                                <StepperTrigger className="flex items-center justify-end gap-8 w-full text-right bg-transparent border-none p-0 hover:bg-transparent">
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider group-data-[state=active]:text-main-color">{step.subtitle}</p>
                                        <p className="text-sm font-bold text-[#94a3b8] group-data-[state=active]:text-secondary-color group-data-[state=completed]:text-secondary-color">{step.title}</p>
                                    </div>

                                    <StepperIndicator asChild>
                                        <div className={`relative z-10 w-12 h-12 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors duration-300 ${currentStep === step.id ? "bg-main border-main-color text-white" : "bg-white border-[#cbd5e1] text-[#cbd5e1] group-data-[state=completed]:border-main-color group-data-[state=completed]:text-main-color"}`}>
                                            <step.icon size={20} variant={currentStep === step.id ? "Bold" : "Outline"} color={currentStep === step.id ? "#ffffff" : "#18abc6"} />
                                        </div>
                                    </StepperIndicator>

                                    <div className="relative z-10 w-4 flex justify-center shrink-0 bg-white py-1">
                                        <div className={`w-3.5 h-3.5 rounded-full border-[3px] border-white transition-colors duration-300 ${currentStep === step.id ? "bg-main shadow-[0_0_0_2px_var(--main-color)]" : currentStep > step.id ? "bg-main" : "bg-[#cbd5e1]"}`} />
                                    </div>
                                </StepperTrigger>
                            </StepperItem>
                        ))}
                    </StepperNav>

                    <div className="flex-1 flex flex-col max-w-3xl w-full">
                        <h2 className="text-2xl font-bold secondary-color mb-1">Step {currentStep}</h2>

                        <p className="text-sm text-des mb-8">Complete information in step {currentStep} to move to step {currentStep + 1 > 4 ? 4 : currentStep + 1}</p>

                        <StepperPanel className="flex-1">
                            <StepperContent value={1}>
                                <Step1BasicInfo initial={step1Data} onChange={(d) => setStep1Data(d)} />
                            </StepperContent>

                            <StepperContent value={2}>
                                <Step2ImagePrice showPrice={true} photoMinHeightClass="min-h-44" initial={{ image: step2Data.image, price: step2Data.price }} onChangeAction={(d) => setStep2Data(d)} />
                            </StepperContent>

                            <StepperContent value={3}>
                                <Step4Location initial={{ province: step4Data.province, district: step4Data.district, commune: step4Data.commune, pin: step4Data.pin, specificAddr: step4Data.specificAddr }} onChange={(d) => setStep4Data(d)} />
                            </StepperContent>

                            <StepperContent value={4}>
                                <Step3Agenda initialDays={step3Data} eventStartDate={step1Data.startDate} eventEndDate={step1Data.endDate} onChangeAction={(d) => setStep3Data(d)} />
                            </StepperContent>
                        </StepperPanel>

                        <div className="flex items-center justify-end gap-4 mt-4">
                            {currentStep > 1 && (
                                <button onClick={prevStep} className="px-8 py-3 rounded-xl font-semibold text-[#64748b] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors flex items-center gap-2 cursor-pointer">
                                    <ArrowLeft size={18} color="#64748b" />
                                    Previous
                                </button>
                            )}

                            {currentStep < 4 ? (
                                <button onClick={nextStep} className="px-10 py-3 rounded-xl font-semibold text-white bg-main hover:opacity-90 cursor-pointer transition-opacity flex items-center gap-2">
                                    Next
                                    <ArrowRight size={18} color="#ffffff" />
                                </button>
                            ) : (
                                <button onClick={() => handleSubmit(true)} className="px-10 py-3 rounded-xl font-semibold text-white bg-main hover:opacity-90 cursor-pointer transition-opacity">
                                    Save
                                </button>
                            )}
                        </div>
                    </div>
                </Stepper>
            </div>
        </div>
    );
}