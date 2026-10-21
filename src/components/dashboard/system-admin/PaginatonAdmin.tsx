"use client"

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

export function PaginationAdmin() {
    return (
        <Pagination className="w-full h-full">
            <div className="flex flex-wrap items-center justify-between gap-170">
                <p className="text-black font-inter text-md text-center">Showing 1 to 8 of 20 entities</p>
                <PaginationContent className="flex items-center gap-3">
                    <PaginationItem>
                        <div className="">
                            <PaginationPrevious href="#" className="bg-gray-100 px-1" />
                        </div>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#" className="bg-gray-100 px-1">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#" isActive className="bg-main text-white">
                            2
                        </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#" className="bg-gray-100 px-1">5</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext href="#" className="bg-gray-100 px-1" />
                    </PaginationItem>
                </PaginationContent>
            </div>
        </Pagination>
    )
}
