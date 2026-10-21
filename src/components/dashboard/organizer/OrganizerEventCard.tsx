"use client";

import Image from "next/image";
import { Heart, Location, Calendar, More, ArrowRight2, Export, Edit2, Trash } from "iconsax-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { getCategoryConfig } from "@/constant/category.config";

export interface EventProps {
    id: string | number;
    title: string;
    location: string;
    price: string | number | null | undefined;
    rating: number;
    date: string;
    category: string;
    description: string;
    image: string;
}

export default function OrganizerEventCard({ id, title, location, price, rating, date, category, description, image, onDelete, detailsHref }: EventProps & { onDelete?: () => void; detailsHref?: string }) {
    const { key: categoryKey, config: categoryConfig } = getCategoryConfig(category);
    const CategoryIcon = categoryConfig.icon;

    const priceLabel = typeof price === "number"
        ? price === 0
            ? "FREE"
            : `$${price.toFixed(2)}`
        : typeof price === "string"
            ? price.trim() || "FREE"
            : "FREE";

    const isFree =
        (typeof price === "number" && price === 0) ||
        priceLabel.toUpperCase() === "FREE";

    return (
        <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-sm transition-all duration-300 flex flex-col group mx-auto">
            <div className="relative w-full aspect-4/3 min-h-40 bg-gray-200 overflow-hidden shrink-0">
                <Image src={image} alt={title} fill unoptimized className="object-cover" />

                <div className="absolute top-3 left-3 bg-(--secondary-color) backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-regular flex items-center gap-1.5 text-white w-max max-w-[calc(100%-100px)]">
                    <Location size={16} color="currentColor" className="text-gray-200" /> {location}
                </div>

                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm ${isFree ? "bg-[#E8F7FA] main-color" : "bg-[#ffeaf0] text-(--accent-color)"
                    }`}>
                    {priceLabel}
                </div>

                <div className="absolute bottom-3 left-4 text-white z-10">
                    <h3 className="text-base font-bold drop-shadow-md">{title}</h3>
                </div>

                <div className="absolute bottom-3 right-4 bg-white/20 backdrop-blur-md border border-white/20 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 z-10 w-max">
                    {rating}<Image src="/images/YellowStarIcon.svg" alt="Star" width={12} height={12} />
                </div>

                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>
            </div>

            <div className="p-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center gap-2 text-[#475467] text-sm font-medium">
                        <Calendar size={20} color="currentColor" className="main-color" /> {date}
                    </div>
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="text-black hover:text-gray-600 transition">
                                    <More size={20} color="currentColor" className="rotate-90" />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent>
                                {id && (
                                    <DropdownMenuItem>
                                        <Link href={`/organizer/events/${id}/edit`} className="w-full flex items-center gap-2">
                                            <Edit2 size={14} /> Edit
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem variant="destructive" onSelect={() => onDelete && onDelete()}>
                                    <div className="flex items-center gap-2"><Trash size={14} /> Delete</div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full w-max mb-4 tracking-widest uppercase shrink-0 border"
                    style={{
                        borderColor: categoryConfig.color,
                        color: categoryConfig.color,
                        backgroundColor: categoryConfig.bg,
                    }}
                >
                    <CategoryIcon size={12} />
                    {categoryKey}
                </span>

                <p
                    className="text-[#475467] text-base font-regular flex-1 leading-relaxed mt-1"
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {description}
                </p>

                <div className="flex items-center justify-between mt-3 shrink-0 pt-2 border-t border-gray-100">
                    <div className="flex gap-4 text-gray-400">
                        <button className="hover:text-(--accent-color) transition cursor-pointer"><Heart size={20} color="currentColor" /></button>
                        <button className="hover:text-(--main-color) transition cursor-pointer"><Export size={20} color="currentColor" /></button>
                    </div>
                    <Link href={detailsHref || `/events/${id}`} className="text-xs font-regular text-gray-700 flex items-center gap-0.5 hover:text-(--main-color) transition-opacity">
                        View Details <ArrowRight2 size={12} color="currentColor" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
