"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { checkInAttendee, CheckInResponse } from "@/services/event.service";
import { EventManagement } from "@/types/organizer.type";
import { TickCircle, CloseCircle, InfoCircle, VolumeHigh, VolumeCross, Camera, Edit } from "iconsax-react";

// Dynamically import Scanner to prevent SSR hydration errors
const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  { ssr: false }
);

interface ScanClientProps {
  events: EventManagement[];
}

function parseQrData(scannedText: string, defaultEventId: string | null): { eventId: string | null; attendeeId: string | null } {
  let eventId: string | null = null;
  let attendeeId: string | null = null;

  try {
    // 1. Try to parse as JSON
    const parsed = JSON.parse(scannedText);
    if (parsed && typeof parsed === "object") {
      eventId = parsed.eventId || parsed.event_id || null;
      attendeeId = parsed.attendeeId || parsed.attendee_id || parsed.userId || parsed.user_id || null;
    }
  } catch {
    // Ignore JSON error
  }

  // 2. Try to parse as URL
  if (!eventId || !attendeeId) {
    try {
      if (scannedText.startsWith("http://") || scannedText.startsWith("https://")) {
        const url = new URL(scannedText);
        // Check query params
        eventId = url.searchParams.get("eventId") || url.searchParams.get("event_id");
        attendeeId = url.searchParams.get("attendeeId") || url.searchParams.get("attendee_id") || url.searchParams.get("userId") || url.searchParams.get("user_id");

        // Check path variables (e.g. /events/{eventId}/attendees/{attendeeId}/check-in)
        const pathParts = url.pathname.split("/");
        const eventsIndex = pathParts.indexOf("events");
        const attendeesIndex = pathParts.indexOf("attendees");
        if (eventsIndex !== -1 && eventsIndex + 1 < pathParts.length) {
          eventId = eventId || pathParts[eventsIndex + 1];
        }
        if (attendeesIndex !== -1 && attendeesIndex + 1 < pathParts.length) {
          attendeeId = attendeeId || pathParts[attendeesIndex + 1];
        }
      }
    } catch {
      // Ignore URL error
    }
  }

  // 3. Try to parse as colon-separated: eventId:attendeeId or attendeeId only
  if (!eventId || !attendeeId) {
    if (scannedText.includes(":")) {
      const parts = scannedText.split(":");
      if (parts.length >= 2) {
        eventId = parts[0].trim();
        attendeeId = parts[1].trim();
      }
    } else if (scannedText.includes(",")) {
      const parts = scannedText.split(",");
      if (parts.length >= 2) {
        eventId = parts[0].trim();
        attendeeId = parts[1].trim();
      }
    } else {
      // Treat entire scanned text as attendeeId if it is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(scannedText.trim())) {
        attendeeId = scannedText.trim();
      }
    }
  }

  // Fallback to selected eventId if not found in QR code
  if (!eventId) {
    eventId = defaultEventId;
  }

  return { eventId, attendeeId };
}

export default function ScanClient({ events = [] }: ScanClientProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [manualAttendeeId, setManualAttendeeId] = useState("");
  const [paused, setPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  // Permission states
  const [permissionState, setPermissionState] = useState<PermissionState | "checking" | "unsupported">("checking");
  const [permissionError, setPermissionError] = useState(false);

  const isBlocked = permissionState === "denied" || permissionError;

  // Monitor camera permission status
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.permissions) {
      setPermissionState("unsupported");
      return;
    }

    let permissionStatus: PermissionStatus | null = null;

    navigator.permissions
      .query({ name: "camera" as PermissionName })
      .then((status) => {
        permissionStatus = status;
        setPermissionState(status.state);
        status.onchange = () => {
          setPermissionState(status.state);
        };
      })
      .catch((err) => {
        console.warn("Permissions API not fully supported for camera:", err);
        setPermissionState("unsupported");
      });

    return () => {
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, []);

  const handleRetryPermission = async () => {
    setPermissionError(false);
    
    // 1. First re-check permissions query if available
    if (typeof window !== "undefined" && navigator.permissions) {
      try {
        const status = await navigator.permissions.query({ name: "camera" as PermissionName });
        setPermissionState(status.state);
        if (status.state === "granted") {
          return; // It's allowed now
        }
      } catch (err) {
        console.warn("Error querying permissions on retry:", err);
      }
    }

    // 2. Trigger getUserMedia. If permission is reset to default (prompt) or allowed, this prompts/grants camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // If it succeeded, stop the tracks to release the camera immediately
      stream.getTracks().forEach((track) => track.stop());
      setPermissionState("granted");
      setPermissionError(false);
    } catch (err) {
      console.warn("Camera request on retry failed:", err);
      setPermissionError(true);
    }
  };

  const handleScannerError = (err: any) => {
    console.log("QR Scan Error:", err);
    const errMsg = String(err?.message || err);
    if (
      errMsg.includes("NotAllowedError") ||
      errMsg.includes("PermissionDeniedError") ||
      errMsg.includes("Permission denied") ||
      errMsg.includes("Permission request denied")
    ) {
      setPermissionError(true);
    }
  };

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean;
    title: string;
    message: string;
    data?: CheckInResponse;
  } | null>(null);

  // Initialize selected event
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].eventId);
    }
  }, [events, selectedEventId]);

  const playBeep = (type: "success" | "error") => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, ctx.currentTime); // Low note
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (err) {
      console.error("Audio beep failed:", err);
    }
  };

  const handleCheckIn = async (eventId: string, attendeeId: string) => {
    setIsVerifying(true);
    setPaused(true);
    try {
      const result = await checkInAttendee(eventId, attendeeId);
      playBeep("success");
      setCheckInResult({
        success: true,
        title: result.data.firstTime ? "Check-in Successful" : "Already Checked In",
        message: result.message || result.data.message || "Attendee successfully verified.",
        data: result.data,
      });
    } catch (error: any) {
      playBeep("error");
      setCheckInResult({
        success: false,
        title: "Check-in Failed",
        message: error instanceof Error ? error.message : (error?.message || "Verify failure. Ensure this ticket belongs to the selected event."),
      });
    } finally {
      setIsVerifying(false);
      setModalOpen(true);
    }
  };

  const handleScan = async (results: any[]) => {
    if (paused || isVerifying || modalOpen) return;
    if (results && results.length > 0) {
      const scannedText = results[0].rawValue;
      if (!scannedText) return;

      const { eventId, attendeeId } = parseQrData(scannedText, selectedEventId || null);

      if (!attendeeId) {
        playBeep("error");
        setCheckInResult({
          success: false,
          title: "Invalid QR Code",
          message: "The scanned QR code does not contain a valid attendee/ticket identifier.",
        });
        setModalOpen(true);
        setPaused(true);
        return;
      }

      const finalEventId = eventId || selectedEventId;
      if (!finalEventId) {
        playBeep("error");
        setCheckInResult({
          success: false,
          title: "Select an Event",
          message: "Please select which event you are scanning for before checking in.",
        });
        setModalOpen(true);
        setPaused(true);
        return;
      }

      await handleCheckIn(finalEventId, attendeeId);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) {
      alert("Please select an event first.");
      return;
    }
    if (!manualAttendeeId.trim()) {
      alert("Please enter a valid Attendee ID.");
      return;
    }
    await handleCheckIn(selectedEventId, manualAttendeeId.trim());
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCheckInResult(null);
    setManualAttendeeId("");
    // Give it a small timeout before resuming scanning to avoid instant duplicate scans
    setTimeout(() => {
      setPaused(false);
    }, 500);
  };

  return (
    <div className="bg-white min-h-full p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center max-w-4xl mx-auto w-full">
      <style>{`
        @keyframes scan-laser {
          0% { top: 2%; }
          50% { top: 96%; }
          100% { top: 2%; }
        }
        .laser-line {
          position: absolute;
          left: 4%;
          width: 92%;
          height: 3px;
          background: linear-gradient(90deg, transparent, #18ABC6, transparent);
          box-shadow: 0 0 10px #18ABC6;
          animation: scan-laser 2.5s infinite ease-in-out;
          z-index: 10;
        }
        .scanner-corner-tl {
          position: absolute;
          top: 0;
          left: 0;
          width: 24px;
          height: 24px;
          border-top: 4px solid #18ABC6;
          border-left: 4px solid #18ABC6;
          border-top-left-radius: 12px;
          z-index: 20;
        }
        .scanner-corner-tr {
          position: absolute;
          top: 0;
          right: 0;
          width: 24px;
          height: 24px;
          border-top: 4px solid #18ABC6;
          border-right: 4px solid #18ABC6;
          border-top-right-radius: 12px;
          z-index: 20;
        }
        .scanner-corner-bl {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 24px;
          height: 24px;
          border-bottom: 4px solid #18ABC6;
          border-left: 4px solid #18ABC6;
          border-bottom-left-radius: 12px;
          z-index: 20;
        }
        .scanner-corner-br {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 24px;
          height: 24px;
          border-bottom: 4px solid #18ABC6;
          border-right: 4px solid #18ABC6;
          border-bottom-right-radius: 12px;
          z-index: 20;
        }
      `}</style>

      {/* Header section */}
      <div className="w-full text-center space-y-2 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-(--secondary-color)">
          Attendee Check-in
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Scan the QR code from the attendee's ticket email or input their ID manually to verify event check-in.
        </p>
      </div>

      {/* Controls Container */}
      <div className="w-full max-w-md space-y-5">
        {/* Event Selector Dropdown */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 block">
            Select Active Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2.5 px-4 rounded-xl text-sm font-medium focus:ring-2 focus:ring-(--main-color) focus:border-transparent outline-none transition-all"
          >
            {events.length === 0 ? (
              <option value="">No events available</option>
            ) : (
              events.map((event) => (
                <option key={event.eventId} value={event.eventId}>
                  {event.title}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Tab Selector between Camera and Manual Input */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => {
              setMode("camera");
              setPaused(false);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              mode === "camera"
                ? "bg-white text-(--secondary-color) shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Camera size={16} variant={mode === "camera" ? "Bold" : "Linear"} />
            Scan QR Code
          </button>
          <button
            onClick={() => {
              setMode("manual");
              setPaused(true);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              mode === "manual"
                ? "bg-white text-(--secondary-color) shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Edit size={16} variant={mode === "manual" ? "Bold" : "Linear"} />
            Manual Entry
          </button>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="w-full flex-1 flex flex-col items-center justify-center mt-8 min-h-[320px]">
        {mode === "camera" ? (
          <div className="w-full max-w-md flex flex-col items-center">
            {/* Audio Toggle & Scan Status */}
            <div className="flex items-center justify-between w-full mb-3 px-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${paused ? "bg-amber-500" : "bg-green-500 animate-pulse"}`} />
                {isVerifying ? "Verifying ticket..." : paused ? "Scanner Paused" : "Active & Scanning"}
              </span>

              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
                title={soundEnabled ? "Mute beep sound" : "Unmute beep sound"}
              >
                {soundEnabled ? <VolumeHigh size={18} /> : <VolumeCross size={18} />}
              </button>
            </div>

            {/* QR Scanner Screen */}
            <div className="w-full aspect-square bg-slate-950 rounded-2xl border border-slate-200 overflow-hidden relative shadow-md flex items-center justify-center">
              {isBlocked ? (
                <div className="absolute inset-0 bg-slate-900 p-6 flex flex-col justify-center text-white overflow-y-auto">
                  {/* Top Header */}
                  <div className="flex flex-col items-center text-center mt-2">
                    <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mb-3 relative">
                      <span className="absolute inset-0 rounded-full bg-red-500/5 animate-pulse" />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 text-red-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-slate-100">Camera Access Blocked</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      We need access to your camera to scan tickets. Please update your browser permission.
                    </p>
                  </div>

                  {/* Step instructions */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 mt-5 text-xs space-y-4 max-w-xs mx-auto w-full">
                    <div className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-semibold flex items-center justify-center text-[10px]">
                        1
                      </span>
                      <div>
                        <p className="text-slate-200 font-medium">Reset Status</p>
                        <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                          Click the lock or settings icon in the address bar next to the website URL.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-semibold flex items-center justify-center text-[10px]">
                        2
                      </span>
                      <div>
                        <p className="text-slate-200 font-medium">Allow Camera</p>
                        <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                          Change the Camera setting to Allow or Ask (default).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-semibold flex items-center justify-center text-[10px]">
                        3
                      </span>
                      <div>
                        <p className="text-slate-200 font-medium">Reload Page</p>
                        <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                          Refresh the webpage to apply your changes and start scanning.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Scan HUD Overlay */}
                  <div className="absolute inset-0 z-20 pointer-events-none p-8 flex items-center justify-center">
                    <div className="w-full h-full relative border border-white/10 rounded-xl">
                      <div className="scanner-corner-tl" />
                      <div className="scanner-corner-tr" />
                      <div className="scanner-corner-bl" />
                      <div className="scanner-corner-br" />
                      {!paused && !modalOpen && <div className="laser-line" />}
                    </div>
                  </div>

                  {/* Loader */}
                  {isVerifying && (
                    <div className="absolute inset-0 bg-black/60 z-30 flex flex-col items-center justify-center text-white space-y-3">
                      <div className="w-8 h-8 border-2 border-(--main-color) border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium">Verifying Ticket...</span>
                    </div>
                  )}

                  {/* Scanner Component */}
                  <div className="w-full h-full [&>video]:object-cover">
                    <Scanner
                      onScan={handleScan}
                      onError={handleScannerError}
                      paused={paused || modalOpen || isVerifying}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Manual Input Mode */
          <form
            onSubmit={handleManualSubmit}
            className="w-full max-w-md bg-slate-50 rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 block">
                Attendee or Ticket ID (UUID)
              </label>
              <input
                type="text"
                placeholder="Enter attendee UUID..."
                value={manualAttendeeId}
                onChange={(e) => setManualAttendeeId(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 py-2.5 px-4 rounded-xl text-sm focus:ring-2 focus:ring-(--main-color) focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-mono"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isVerifying || !manualAttendeeId.trim() || !selectedEventId}
              className="w-full bg-(--main-color) text-white font-bold py-2.5 rounded-xl text-sm shadow hover:bg-(--main-color)/90 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Check In"
              )}
            </button>
          </form>
        )}
      </div>

      {/* Pop-up Check-in Status Modal */}
      {modalOpen && checkInResult && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
            onClick={handleCloseModal}
          />

          {/* Modal Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative z-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-200 border border-slate-100">
            {/* Status Icon */}
            {checkInResult.success ? (
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-200 shadow-sm animate-pulse">
                <TickCircle size={36} color="#10B981" variant="Bold" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 border border-red-200 shadow-sm">
                <CloseCircle size={36} color="#EF4444" variant="Bold" />
              </div>
            )}

            {/* Title & Description */}
            <h3 className={`text-lg md:text-xl font-extrabold ${checkInResult.success ? "text-slate-800" : "text-red-600"}`}>
              {checkInResult.title}
            </h3>
            
            {/* Badges for FirstTime Check-In vs Already Checked In */}
            {checkInResult.success && checkInResult.data && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-2.5 ${
                checkInResult.data.firstTime 
                  ? "bg-green-100 text-green-700 border border-green-200" 
                  : "bg-amber-100 text-amber-700 border border-amber-200"
              }`}>
                {checkInResult.data.firstTime ? "First Time Check-In" : "Already Verified"}
              </span>
            )}

            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              {checkInResult.message}
            </p>

            {/* Attendee Details Card */}
            {checkInResult.success && checkInResult.data?.attendee && (
              <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-200/50 mt-5 text-left space-y-2">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Attendee Name</span>
                  <span className="text-sm font-semibold text-slate-800">{checkInResult.data.attendee.fullName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</span>
                  <span className="text-sm font-medium text-slate-600 truncate">{checkInResult.data.attendee.email}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Check-in Time</span>
                  <span className="text-xs font-medium text-slate-500">
                    {new Date(checkInResult.data.attendee.checkInAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </span>
                </div>
              </div>
            )}

            {/* Dismiss Action Button */}
            <button
              onClick={handleCloseModal}
              className={`w-full font-bold py-3 rounded-xl text-sm shadow mt-6 transition-all active:scale-95 cursor-pointer ${
                checkInResult.success 
                  ? "bg-(--main-color) text-white hover:bg-(--main-color)/90" 
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Scan Next Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
