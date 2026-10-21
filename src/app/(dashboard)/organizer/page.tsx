import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight2, Location } from "iconsax-react";
import AttendanceChart from "@/components/dashboard/organizer/AttendanceChart";
import KpiGrid from "@/components/dashboard/organizer/KpiGrid";
import { getCategoryConfig } from "@/constant/category.config";
import {
  getOrganizerKpiAction,
  getEventUpcomingAction,
  getTop5EventAction,
  getTotalLikeAndAttendeeAction,
} from "@/actions/organizer.action";
import { resolveUrl } from "@/lib/format";
import { getProvinceLabel } from "@/constant/province";
import { getCategories } from "@/services/category.service";

function formatEventDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function DashboardOverview() {
  // fetch everything in parallel on the server
  const [kpiResult, upcomingResult, top5Result, chartResult, categories] =
    await Promise.all([
      getOrganizerKpiAction(),
      getEventUpcomingAction(),
      getTop5EventAction(),
      getTotalLikeAndAttendeeAction(),
      getCategories(),
    ]);

  const upcoming = upcomingResult.data.slice(0, 3);
  const topEvent = top5Result.data;
  const upcomingError = upcomingResult.success ? null : upcomingResult.error;

  // The /events/top response only includes categoryId (a UUID), no name —
  // map it to the category name so we can resolve the icon/color config.
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

  const renderedTopEvents = topEvent.map((event) => {
    const categoryRaw =
      (typeof event.categoryId === "object" && event.categoryId
        ? event.categoryId.name
        : typeof event.categoryId === "string"
          ? categoryNameById.get(event.categoryId)
          : undefined) ??
      event.categoryName ??
      "";
    const { key: categoryKey, config: categoryConfig } =
      getCategoryConfig(categoryRaw);
    const CategoryIcon = categoryConfig.icon;

    return (
      <div
        key={event.eventId}
        className="rounded-[14px] border border-(--input-border) p-3 bg-white"
      >
        <div className="relative w-full aspect-4/3 overflow-hidden rounded-md">
          <Image
            src={resolveUrl(event.cover)}
            alt={event.title}
            className="w-full h-62.5 object-cover"
            width={800}
            height={250}
          />
          <div className="absolute top-3 left-3 bg-white/60 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold z-10">
            <Image
              src={"/images/Top5EventStarIcon.svg"}
              alt="Star"
              width={12}
              height={12}
            />
            <span>{event.ratingCount}</span>
          </div>
          <div className="absolute top-3 right-3 bg-white text-[#FF3366] text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
            {Number(event.price) === 0 ? "Free" : `$${event.price}`}
          </div>
        </div>
        <div className="mt-3 flex flex-col flex-1">
          <div className="flex justify-between items-center gap-2">
            <h3 className="font-bold secondary-color text-[15px] truncate">
              {event.title}
            </h3>
            <span
              className="inline-flex items-center gap-1 border text-[10px] font-bold px-2.5 py-1 rounded-full uppercase whitespace-nowrap"
              style={{
                color: categoryConfig.color,
                borderColor: categoryConfig.color,
                backgroundColor: categoryConfig.bg,
              }}
            >
              <CategoryIcon size={12} strokeWidth={2.5} />
              {categoryKey}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 secondary-color">
            <Calendar size={16} color="var(--main-color)" />
            <span className="text-[12px] font-medium tracking-tight">
              {formatEventDate(event.startAt)}
            </span>{" "}
            -
            <span className="text-[12px] font-medium tracking-tight">
              {formatEventDate(event.endAt)}
            </span>
          </div>
          <Link href={`/organizer/events/${event.eventId}`} className="mt-auto">
            <button className="w-full mt-5 bg-main text-white font-semibold py-2.5 rounded-full text-[13px] hover:opacity-90 transition-opacity cursor-pointer">
              See Detail
            </button>
          </Link>
        </div>
      </div>
    );
  });

  return (
    <div className="w-full flex flex-col gap-4">
      <KpiGrid
        data={kpiResult.data}
        error={kpiResult.success ? null : kpiResult.error}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 w-full">
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 card-shadow w-full flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold secondary-color">
              Total Like and Attendee per month
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent"></span>
                <span className="text-sm font-medium text-des">Attendee</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-main"></span>
                <span className="text-sm font-medium text-des">Like</span>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-75 w-full">
            <AttendanceChart data={chartResult.data} />
          </div>
        </div>

        <div className="xl:col-span-1 bg-white rounded-2xl p-6 card-shadow w-full flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold secondary-color">
              Upcoming Event
            </h2>
            <Link
              href="/organizer/events?tab=upcoming"
              className="flex items-center gap-1 text-sm text-des cursor-pointer hover:text-(--main-color) transition-opacity"
            >
              View more <ArrowRight2 size={14} color="#18abc6" />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {upcomingError && (
              <p className="text-sm text-red-500">
                Failed to load upcoming events
              </p>
            )}

            {!upcomingError && upcoming.length === 0 && (
              <p className="text-sm text-des">No upcoming events</p>
            )}

            {!upcomingError &&
              upcoming.map((event) => {
                const { key: categoryKey, config: categoryConfig } =
                  getCategoryConfig(event.categoryName ?? "");
                const CategoryIcon = categoryConfig.icon;
                const isFree = Number(event.price) === 0;

                return (
                  <Link
                    key={event.eventId}
                    href={`/organizer/events/${event.eventId}`}
                    className="flex gap-3 items-start border border-(--input-border) hover:bg-gray-50/50 rounded-xl transition-colors p-3"
                  >
                    <div className="w-17 h-17 shrink-0">
                      <Image
                        src={resolveUrl(event.image)}
                        alt={event.title}
                        width={100}
                        height={100}
                        className="w-full h-full rounded-xl border border-(--input-border) shadow-sm flex items-center justify-center text-xl object-cover"
                      />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-sm font-bold secondary-color truncate">
                          {event.title}
                        </h4>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-bold rounded-full tracking-widest uppercase shrink-0"
                          style={{
                            backgroundColor: categoryConfig.bg,
                            borderColor: categoryConfig.color,
                            color: categoryConfig.color,
                          }}
                        >
                          <CategoryIcon size={12} strokeWidth={2.5} />
                          {categoryKey}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar
                          size={15}
                          color="var(--main-color)"
                          variant="Outline"
                          className="shrink-0"
                        />
                        <p className="text-xs secondary-color font-inter flex items-center gap-1">
                          {formatEventDate(event.startAt)}
                          {" - "}
                          {formatEventDate(event.endAt)}
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 min-w-0">
                          <Location
                            size={15}
                            color="var(--accent-color)"
                            variant="Outline"
                            className="shrink-0"
                          />
                          <p className="text-xs secondary-color truncate font-medium">
                            {getProvinceLabel(event.province)}
                          </p>
                        </div>
                        <div
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                            isFree
                              ? "bg-[#ecfdf5] text-[#10b981]"
                              : "bg-[#fef2f2] text-(--accent-color)"
                          }`}
                        >
                          {isFree ? "Free" : `$${event.price}`}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </div>

      <div className="w-full bg-white rounded-2xl p-6 card-shadow">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold secondary-color">Top 5 Event</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
          {renderedTopEvents}
        </div>
      </div>
    </div>
  );
}
