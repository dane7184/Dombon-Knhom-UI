"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft2, Calendar, Gallery, Clock, Location, ArrowRight, ArrowLeft } from "iconsax-react";
import { useSession } from "next-auth/react";
import { fetchEventDetails } from "@/services/event.service";
import { fetchCategories } from "@/services/category.service";
import { toast } from "sonner";
import Toast from "@/components/modals/Toast";
import { useEventForm } from "@/hooks/useEventForm";
import Step1BasicInfo, { type Step1Data } from "@/components/dashboard/organizer/FirstStep";
import Step2ImagePrice from "@/components/dashboard/organizer/SecondStep";
import Step3Agenda from "@/components/dashboard/organizer/FourthStep";
import Step4Location from "@/components/dashboard/organizer/ThirdStep";
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

type EditableEvent = {
  id: number | string;
  title?: string;
  category?: string;
  description?: string;
  date?: string;
  location?: string;
  image?: string;
  type?: string;
  province?: string;
  district?: string;
  commune?: string;
  agenda?: AgendaDay[];
};

const parseLocationParts = (location?: string) => {
  const parts = String(location ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    province: parts[0] ?? "",
    district: parts[1] ?? "",
    commune: parts[2] ?? "",
  };
};

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

export default function page({ params }: { params: Promise<{ eventId: string }> }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { eventId } = React.use(params);

  const [loading, setLoading] = React.useState(true);
  const [event, setEvent] = React.useState<EditableEvent | null>(null);

  const {
      currentStep, setCurrentStep,
      step1Data: step1, setStep1Data: setStep1,
      step2Data: step2, setStep2Data: setStep2,
      step3Data: step3, setStep3Data: setStep3,
      step4Data: step4, setStep4Data: setStep4,
      nextStep, prevStep,
      isCurrentStepValid,
      handleSubmit
  } = useEventForm({
      isOrganizer: false,
      sessionToken: session?.user?.accessToken,
      eventId: String(eventId),
      onSuccess: () => router.push(`/profile/${session?.user?.userId}?tab=created&status=Pending`),
  });

  const progressHeight = ((currentStep - 1) / (steps.length - 1)) * 100;

  React.useEffect(() => {
    const loadEvent = async () => {
      try {
        const data = (await fetchEventDetails(String(eventId))) as {
          title?: string;
          eventName?: string;
          categoryId?: string;
          description?: string;
          startAt?: string;
          endAt?: string;
          capacity?: number | string;
          cover?: string;
          agenda?: Record<string, { startTime?: string; endTime?: string; speakerName?: string; speaker?: string; description?: string }[]> | { startTime?: string; endTime?: string; speakerName?: string; speaker?: string; description?: string }[];
          district?: string;
          commune?: string;
          province?: string;
          address?: string | { district?: string; commune?: string; specificAddr?: string };
          latitude?: number;
          longitude?: number;
        };

        setEvent(data as EditableEvent);

        let categoryName = "Other";
        if (data.categoryId) {
          try {
            const cats = await fetchCategories({ page: 1, size: 100 });
            const match = cats.find((c) => c.categoryId === data.categoryId);
            if (match?.name) categoryName = match.name;
          } catch {}
        }

        setStep1({
          title: (data.title || data.eventName) as string,
          category: categoryName,
          description: (data.description as string) || "",
          startDate: data.startAt ? (data.startAt as string).split("T")[0] : "",
          endDate: data.endAt ? (data.endAt as string).split("T")[0] : "",
          capacity: data.capacity ? Number(data.capacity) : ""
        });

        setStep2({
          image: (data.cover as string) || "/images/EventCard3.jpg"
        });

        let mappedAgenda: AgendaDay[] = [];
        if (data.agenda && typeof data.agenda === 'object') {
          let dayIndex = 1;
          for (const [dateValue, itemsArray] of Object.entries(data.agenda)) {
            const items = Array.isArray(itemsArray) ? itemsArray : [];
            if (items.length === 0) continue;

            const item = items[0] as { startTime?: string; endTime?: string; speakerName?: string; speaker?: string; description?: string };
            const cleanDate = dateValue.split(/[T ]/)[0];
            const cleanStart = ((item.startTime as string) || "08:00").substring(0, 5);
            const cleanEnd = ((item.endTime as string) || "12:00").substring(0, 5);

            mappedAgenda.push({
              id: dayIndex,
              dateValue: cleanDate,
              dayLabel: `Day ${dayIndex}`,
              dateLabel: new Date(cleanDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
              accentColor: dayIndex % 2 === 0 ? "#d946ef" : "#22c55e",
              start: cleanStart,
              end: cleanEnd,
              speaker: String(item.speakerName || item.speaker || "General Speaker"),
              description: String(item.description || "")
            });
            dayIndex++;
          }
        }
        setStep3(mappedAgenda);

        let addressParts: string[] = [];
        let specAddr = "";
        let d = (data.district as string) || "";
        let c = (data.commune as string) || "";

        if (data.address) {
          if (typeof data.address === 'string') {
            addressParts = data.address.split(",").map((s: string) => s.trim());
            if (!d) d = addressParts[1] || "";
            if (!c) c = addressParts[2] || "";
            specAddr = addressParts.slice(3).join(", ") || "";
          } else if (typeof data.address === 'object' && data.address !== null) {
            const addrObj = data.address as { district?: string; commune?: string; specificAddr?: string };
            if (!d) d = (addrObj.district as string) || "";
            if (!c) c = (addrObj.commune as string) || "";
            specAddr = (addrObj.specificAddr as string) || "";
          }
        }

        const p = ((data.province as string) || addressParts[0] || "").replace(/_/g, ' ');
        d = d.replace(/_/g, ' ');
        c = c.replace(/_/g, ' ');

        setStep4({
          province: p,
          district: d,
          commune: c,
          specificAddr: specAddr,
          pin: data.latitude && data.longitude ? { lat: data.latitude as number, lng: data.longitude as number } : null
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    loadEvent();
  }, [eventId]);

  if (loading) return <div className="pt-28 p-4">Loading...</div>;

  if (!event) return (
    <div className="pt-28 p-4">Event not found</div>
  );

  return (
    <div className="w-full md:w-[80%] flex flex-col gap-4 pt-27 pb-28 md:pb-0 px-4 md:px-0 m-auto">
      <div className="bg-white rounded-2xl card-shadow w-full md:h-198 py-5 md:py-6 px-5 md:pr-30 md:pl-10 flex flex-col">
        <div className="mb-2 md:pl-15">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-main font-medium mb-4 cursor-pointer hover:text-(--main-color)! transition-colors bg-transparent border-none p-0 outline-none">
            <ArrowLeft size={18} color="currentColor" />
            Back
          </button>
          <h1 className="text-3xl font-extrabold secondary-color mb-1">Edit Event</h1>
          <p className="text-sm text-des">Follow the 4 steps to complete your event creation</p>
        </div>

        <Stepper value={currentStep} onValueChange={setCurrentStep} orientation="vertical" className="flex-1 flex flex-col lg:flex-row gap-12 mt-4 border-t border-[#f3f3f3] pt-2">
          <StepperNav className="hidden lg:flex flex-col relative w-75 shrink-0 gap-18 h-fit self-start">
            <div className="absolute right-20 top-0 bottom-0 w-0.5 bg-[#e2e8f0] z-0">
              <div className="w-full bg-main transition-all duration-500 ease-in-out" style={{ height: `${progressHeight}%` }} />
            </div>

            <div className="absolute right-2 top-0 bottom-0 w-0.5 bg-[#e2e8f0] z-0">
              <div className="w-full bg-main transition-all duration-500 ease-in-out" style={{ height: `${progressHeight}%` }} />
            </div>

            {steps.map((step) => (
              <StepperItem key={step.id} step={step.id} className="group relative w-full">
                <StepperTrigger className="flex items-center justify-end gap-10 w-full text-right bg-transparent border-none p-0 hover:bg-transparent">
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
                    <div className={`w-3.5 h-3.5 rounded-full border-[3px] border-white transition-colors duration-300 ${currentStep === step.id ? "bg-main shadow-[0_0_0_2px_var(--main-color)]" : currentStep > step.id ? "bg-main" : "bg-[#cbd5e1]"}`}></div>
                  </div>
                </StepperTrigger>
              </StepperItem>
            ))}
          </StepperNav>

          <div className="flex-1 min-w-0 flex flex-col w-full max-w-none">
            <h2 className="text-2xl font-bold secondary-color mb-1">Step {currentStep}</h2>
            <p className="text-sm text-des mb-4 md:mb-8">Complete information in step {currentStep} to move to step {currentStep + 1 > 4 ? 4 : currentStep + 1}</p>

            <StepperPanel className="flex-1">
              <StepperContent value={1}><Step1BasicInfo initial={step1} onChange={(d) => setStep1(d)} /></StepperContent>
              <StepperContent value={2}><Step2ImagePrice showPrice={false} initial={step2} onChangeAction={(d) => setStep2(d)} /></StepperContent>
              <StepperContent value={3}><Step4Location initial={step4} onChange={(d) => setStep4(d)} /></StepperContent>
              <StepperContent value={4}><Step3Agenda initialDays={step3} eventStartDate={step1.startDate} eventEndDate={step1.endDate} onChangeAction={(d) => setStep3(d)} /></StepperContent>
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
                <button onClick={() => handleSubmit(true)} className="px-10 py-3 rounded-xl font-semibold text-white bg-main hover:opacity-90 cursor-pointer transition-opacity">Save</button>
              )}
            </div>
          </div>
        </Stepper>
      </div>
    </div>
  );
}
