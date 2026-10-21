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

export function SmallPagination() {
    return (
        <Pagination className="w-full">
            <div className="flex items-center justify-center gap-5 mt-5">
                <p className="text-black font-inter text-xs text-center">Showing 1 to 8</p>
                <PaginationContent className="flex items-center gap-3">
                    <PaginationItem>
                        <div className="">
                            <PaginationPrevious href="#" className="bg-gray-100 px-0"/>
                        </div>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#" className="bg-gray-100 px-0 font-inter text-xs">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationEllipsis/>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#" isActive className="bg-main text-white font-inter text-xs">
                            2
                        </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext href="#" className="bg-gray-100 px-0"/>
                    </PaginationItem>
                </PaginationContent>
            </div>
        </Pagination>
    )
}
