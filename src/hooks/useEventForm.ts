import { useState } from "react";
import { Session } from "next-auth";
import { toast } from "sonner";
import React from "react";
import Toast from "@/components/modals/Toast";
import { fetchCategories } from "@/services/category.service";
import { createEventAction, updateEventAction } from "@/actions/event.actions";
import { uploadEventCover, CreateEventRequest } from "@/services/event.service";
import { switchToOrgAction } from "@/actions/auth.actions";
import { Step1Data } from "@/components/dashboard/organizer/FirstStep";

import { AgendaDay } from "@/types/common.type";
import {
  createAgendaSchema,
  eventLocationSchema,
  eventStep1Schema,
  eventStep2Schema,
  organizerPinSchema,
} from "@/types/schemas/event.schema";

export interface Step2Data {
  image?: string;
  price?: number | string;
}

export interface Step4Data {
  province?: string;
  district?: string;
  commune?: string;
  pin?: { lat: number; lng: number } | null;
  specificAddr?: string;
}

export interface EventFormOptions {
  isOrganizer: boolean;
  orgId?: string | null;
  sessionToken?: string | null;
  updateSession?: (data: {
    user: {
      accessToken?: string;
      refreshToken?: string;
      orgId?: string | null;
      orgName?: string | null;
      logo?: string | null;
    };
  }) => Promise<Session | null>;
  initialData?: {
    step1?: Step1Data;
    step2?: Step2Data;
    step3?: AgendaDay[];
    step4?: Step4Data;
  };
  eventId?: string;
  onSuccess?: (eventId: string) => void;
}

export function useEventForm(options: EventFormOptions) {
  const [currentStep, setCurrentStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState<number[]>([1]);

  const handleSetCurrentStep = (step: number | ((prev: number) => number)) => {
    setCurrentStep((prevStep) => {
      const nextStep = typeof step === "function" ? step(prevStep) : step;
      setVisitedSteps((prevVisited) =>
        prevVisited.includes(nextStep)
          ? prevVisited
          : [...prevVisited, nextStep],
      );
      return nextStep;
    });
  };

  const [step1Data, setStep1Data] = useState<Step1Data>(
    options.initialData?.step1 || {},
  );
  const [step2Data, setStep2Data] = useState<Step2Data>(
    options.initialData?.step2 || {},
  );
  const [step3Data, setStep3Data] = useState<AgendaDay[]>(
    options.initialData?.step3 || [],
  );
  const [step4Data, setStep4Data] = useState<Step4Data>(
    options.initialData?.step4 || {},
  );
  const [createdEventId, setCreatedEventId] = useState<string | null>(
    options.eventId || null,
  );

  const getStep1Errors = () => {
    const result = eventStep1Schema.safeParse({
      title: step1Data.title,
      category: step1Data.category,
      capacity: step1Data.capacity,
      startDate: step1Data.startDate,
      endDate: step1Data.endDate,
      description: step1Data.description,
    });
    if (result.success) return [];
    return result.error.issues.map((issue) => issue.message);
  };

  const isStep1Valid = () => getStep1Errors().length === 0;

  const getStep2Errors = () => {
    const result = eventStep2Schema.safeParse({ image: step2Data.image });
    if (result.success) return [];
    return result.error.issues.map((issue) => issue.message);
  };

  const isStep2Valid = () => getStep2Errors().length === 0;

  const getStep3Errors = () => {
    const result = eventLocationSchema.safeParse({
      province: step4Data.province,
      district: step4Data.district,
      commune: step4Data.commune,
      specificAddr: step4Data.specificAddr,
      pin: step4Data.pin,
    });
    const errors = result.success
      ? []
      : result.error.issues.map((issue) => issue.message);

    if (options.isOrganizer) {
      const pinResult = organizerPinSchema.safeParse(step4Data.pin ?? null);
      if (!pinResult.success) {
        errors.push(...pinResult.error.issues.map((issue) => issue.message));
      }
    }

    return errors;
  };

  const isStep3Valid = () => getStep3Errors().length === 0;

  const getStep4Errors = () => {
    const result = createAgendaSchema(
      step1Data.startDate,
      step1Data.endDate,
    ).safeParse(step3Data);
    if (result.success) return [];
    return result.error.issues.map((issue) => issue.message);
  };

  const isStep4Valid = () => getStep4Errors().length === 0;

  const isCurrentStepValid = () => {
    if (currentStep === 1) return isStep1Valid();
    if (currentStep === 2) return isStep2Valid();
    if (currentStep === 3) return isStep3Valid();
    if (currentStep === 4) return isStep4Valid();
    return true;
  };

  const nextStep = () => {
    handleSetCurrentStep((prev) => Math.min(prev + 1, 5));
  };
  const prevStep = () => handleSetCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (isEdit: boolean = false) => {
    if (!isCurrentStepValid()) {
      const errors = getStep4Errors().filter((e) => !e.includes("HH:MM"));
      const msg =
        errors.length > 0
          ? errors[0]
          : "Please complete all required fields correctly.";
      toast.custom((t) =>
        React.createElement(Toast, {
          title: "Validation Error",
          message: msg,
          type: "error",
          onCloseAction: () => toast.dismiss(t),
        }),
      );
      return;
    }

    const title = step1Data.title ?? `Event ${Date.now()}`;
    const toastId = toast.loading(
      isEdit ? "Updating event..." : "Creating event...",
    );

    let categoryId = "";
    try {
      const searchTerm = (step1Data.category || "").trim();
      const categories = await fetchCategories({ search: searchTerm }).catch(
        () => [],
      );
      if (categories.length > 0) {
        const exact = categories.find(
          (c) => c.name?.toLowerCase() === searchTerm.toLowerCase(),
        );
        const partial = categories.find((c) =>
          c.name?.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        const picked = exact ?? partial ?? categories[0];
        categoryId = picked?.categoryId ?? "";
      }
      if (!categoryId) {
        const allCats = await fetchCategories().catch(() => []);
        if (allCats.length > 0) {
          categoryId = allCats[0].categoryId ?? "";
        }
      }
    } catch (_) {}

    if (!categoryId) {
      categoryId = "40000000-0000-0000-0000-000000000001";
    }

    const pin = step4Data.pin as
      | { lat: number; lng: number }
      | null
      | undefined;
    const payload: Partial<CreateEventRequest> = {
      title,
      categoryId,
      capacity: step1Data.capacity ? Number(step1Data.capacity) : 0,
      startAt: step1Data.startDate || new Date().toISOString().split("T")[0],
      endAt: step1Data.endDate || new Date().toISOString().split("T")[0],
      description: step1Data.description ?? "",
      price: step2Data.price ? Number(step2Data.price) : 0,
      address: {
        district: step4Data.district || "Unknown District",
        commune: step4Data.commune || "Unknown Commune",
        specificAddr: step4Data.specificAddr || "No specific address",
      },
      latitude: pin?.lat ?? 11.5564,
      longitude: pin?.lng ?? 104.9282,
      province: (function (prov: string) {
        if (prov === "Siemreap") return "Siem_Reap";
        if (prov === "Mondul Kiri") return "Mondulkiri";
        if (prov === "Ratanak Kiri") return "Ratanakiri";
        return prov.replace(/\s+/g, "_");
      })(step4Data.province || "Phnom Penh"),
    };

    const agendaData: Record<
      string,
      {
        order: number;
        startTime: string;
        endTime: string;
        speakerName: string;
        description: string;
      }[]
    > = {};
    if (Array.isArray(step3Data) && step3Data.length > 0) {
      step3Data.forEach((day) => {
        if (day.dateValue) {
          if (!agendaData[day.dateValue]) {
            agendaData[day.dateValue] = [];
          }
          agendaData[day.dateValue].push({
            order: agendaData[day.dateValue].length + 1,
            startTime: day.start || "08:00",
            endTime: day.end || "12:00",
            speakerName: day.speaker || "General Speaker",
            description: day.description || "Agenda details for this day.",
          });
        }
      });
    }

    if (Object.keys(agendaData).length > 0) {
      payload.agenda = agendaData;

      // Validate that all agenda dates fall within the event start and end dates
      const eventStart = new Date(payload.startAt as string);
      const eventEnd = new Date(payload.endAt as string);
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(0, 0, 0, 0);

      for (const dateStr of Object.keys(agendaData)) {
        const agendaDate = new Date(dateStr);
        agendaDate.setHours(0, 0, 0, 0);
        if (agendaDate < eventStart || agendaDate > eventEnd) {
          toast.custom(
            (t) =>
              React.createElement(Toast, {
                title: "Validation Error",
                message: `Agenda date ${dateStr} is outside the event's start and end dates.`,
                type: "error",
                onCloseAction: () => toast.dismiss(t),
              }),
            { id: toastId },
          );
          return;
        }
      }
    }

    try {
      let currentToken = options.sessionToken;

      if (options.isOrganizer) {
        if (!options.orgId) {
          toast.custom(
            (t) =>
              React.createElement(Toast, {
                title: "Error",
                message: "Organization ID missing.",
                type: "error",
                onCloseAction: () => toast.dismiss(t),
              }),
            { id: toastId },
          );
          return;
        }
        toast.loading("Authenticating organization context...", {
          id: toastId,
        });
        const switchResult = await switchToOrgAction(options.orgId);

        if (switchResult.success && switchResult.data?.token) {
          currentToken = switchResult.data.token;
          if (options.updateSession) {
            await options.updateSession({
              user: {
                accessToken: switchResult.data.token,
                refreshToken: switchResult.data.refreshToken,
                orgId: switchResult.data.orgId,
                orgName: switchResult.data.orgName,
                logo: switchResult.data.logo ?? null,
              },
            });
          }
        } else {
          const errorMessage = !switchResult.success
            ? switchResult.error
            : "Missing token";
          toast.custom(
            (t) =>
              React.createElement(Toast, {
                title: "Error",
                message: `Failed to authenticate organization: ${errorMessage}`,
                type: "error",
                onCloseAction: () => toast.dismiss(t),
              }),
            { id: toastId },
          );
          return;
        }
      }

      let currentEventId = createdEventId;
      toast.loading(isEdit ? "Updating event..." : "Creating event...", {
        id: toastId,
      });

      if (isEdit && currentEventId) {
        const res = await updateEventAction(
          currentEventId,
          payload as CreateEventRequest,
          currentToken ?? undefined,
        );
        if (!res.success) throw new Error(res.error);
      } else if (!currentEventId) {
        const res = await createEventAction(
          payload as CreateEventRequest,
          currentToken ?? undefined,
        );
        if (!res.success) throw new Error(res.error);
        currentEventId = res.data.eventId;
        setCreatedEventId(currentEventId);
      }

      if (
        step2Data.image &&
        currentEventId &&
        (step2Data.image.startsWith("blob:") ||
          step2Data.image.startsWith("data:"))
      ) {
        toast.loading("Uploading cover image...", { id: toastId });
        const blob = await fetch(step2Data.image).then((r) => r.blob());
        const mimeType = blob.type || "image/jpeg";
        const ext = mimeType.split("/")[1] || "jpg";
        const file = new File([blob], `cover.${ext}`, { type: mimeType });
        await uploadEventCover(currentEventId, file, currentToken ?? undefined);
      }

      toast.dismiss(toastId);
      toast.custom((t) =>
        React.createElement(Toast, {
          title: "Success",
          message: isEdit
            ? "Event updated successfully!"
            : "Event created successfully!",
          type: "success",
          onCloseAction: () => toast.dismiss(t),
        }),
      );

      if (options.onSuccess && currentEventId) {
        options.onSuccess(currentEventId);
      }
    } catch (err) {
      let errMsg = err instanceof Error ? err.message : "Operation failed.";
      if (errMsg.includes("{")) {
        try {
          const parsed = JSON.parse(errMsg.substring(errMsg.indexOf("{")));
          errMsg = parsed.detail || parsed.title || errMsg;
        } catch {}
      }
      toast.dismiss(toastId);
      toast.custom((t) =>
        React.createElement(Toast, {
          title: "Error",
          message: errMsg,
          type: "error",
          onCloseAction: () => toast.dismiss(t),
        }),
      );
    }
  };

  return {
    currentStep,
    setCurrentStep: handleSetCurrentStep,
    visitedSteps,
    step1Data,
    setStep1Data,
    step2Data,
    setStep2Data,
    step3Data,
    setStep3Data,
    step4Data,
    setStep4Data,
    nextStep,
    prevStep,
    isCurrentStepValid,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStep4Valid,
    getStep4Errors,
    handleSubmit,
  };
}
