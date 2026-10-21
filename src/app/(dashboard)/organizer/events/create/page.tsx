"use client";

import React, { useState } from "react";
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
import {
    Stepper,
    StepperContent,
    StepperIndicator,
    StepperItem,
    StepperNav,
    StepperPanel,
    StepperTrigger,
} from "@/components/ui/stepper";
import { useEventForm } from "@/hooks/useEventForm";
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

export default function OrganizerCreateEventPage() {
    const router = useRouter();
    const { data: session, update } = useSession();

    const {
        currentStep, setCurrentStep,
        visitedSteps,
        step1Data, setStep1Data,
        step2Data, setStep2Data,
        step3Data, setStep3Data,
        step4Data, setStep4Data,
        nextStep, prevStep,
        isCurrentStepValid,
        isStep1Valid,
        isStep2Valid,
        isStep3Valid,
        isStep4Valid,
        getStep4Errors,
        handleSubmit
    } = useEventForm({
        isOrganizer: true,
        orgId: session?.user?.orgId,
        sessionToken: session?.user?.accessToken,
        updateSession: update,
        onSuccess: () => router.push("/organizer/events"),
    });

    const getIsStepValid = (stepId: number) => {
        if (stepId === 1) return isStep1Valid();
        if (stepId === 2) return isStep2Valid();
        if (stepId === 3) return isStep3Valid();
        if (stepId === 4) return isStep4Valid();
        return true;
    };

    const progressHeight = ((currentStep - 1) / (steps.length - 1)) * 100;

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="bg-white rounded-2xl card-shadow w-full h-auto lg:h-198 p-5 sm:p-8 lg:py-10 lg:pr-30 lg:pl-10 flex flex-col">
                <div className="mb-2 lg:pl-20">
                    <Link href="/organizer/events" className="inline-flex items-center gap-2 text-main font-medium mb-4 cursor-pointer hover:text-(--main-color)! transition-colors">
                        <ArrowLeft size={18} color="currentColor" />
                        Back
                    </Link>

                    <h1 className="text-3xl font-extrabold secondary-color mb-1">Create Event</h1>

                    <p className="text-sm text-des">Follow the 4 steps to complete your event creation
                        <br />
                        <span className="text-red-500 font-medium">*Note:</span> You can only edit or delete this event up to 3 days before it starts.
                    </p>
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
                                            {!getIsStepValid(step.id) && visitedSteps.includes(step.id) && step.id !== currentStep && (
                                                <span className="absolute -top-1 -right-1 flex items-center justify-center text-[var(--accent-color)] font-extrabold text-lg drop-shadow-sm">
                                                    !
                                                </span>
                                            )}
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
                                <button onClick={() => handleSubmit(false)} className="px-10 py-3 rounded-xl font-semibold text-white bg-main hover:opacity-90 cursor-pointer transition-opacity">
                                    Create Event
                                </button>
                            )}
                        </div>
                    </div>
                </Stepper>
            </div>
        </div>
    );
}
