"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationTableProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  compact?: boolean;
}

export function PaginationTable({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  compact = false,
}: PaginationTableProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const startEntry =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, totalItems);

  // Core navigation handlers
  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handlePageClick = (e: React.MouseEvent, page: number) => {
    e.preventDefault();
    onPageChange(page);
  };

  const renderPageLinks = () => {
    const items = [];
    const maxVisiblePages = 3;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(renderPageLinkItem(i));
      }
    } else {
      items.push(renderPageLinkItem(1));

      if (currentPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }
      if (currentPage !== 1 && currentPage !== totalPages) {
        items.push(renderPageLinkItem(currentPage));
      }

      if (currentPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }
      items.push(renderPageLinkItem(totalPages));
    }

    return items;
  };

  const renderPageLinkItem = (page: number) => {
    const isCurrent = page === currentPage;
    return (
      <PaginationItem key={page}>
        <PaginationLink
          href="#"
          onClick={(e) => handlePageClick(e, page)}
          className={`h-9 w-9 rounded-xl font-medium transition-all ${
            isCurrent
              ? "bg-(--main-color) text-white hover:bg-(--main-color)"
              : "bg-gray-50 text-(--secondary-color) hover:bg-gray-100 border border-gray-100"
          }`}
        >
          {page}
        </PaginationLink>
      </PaginationItem>
    );
  };

  return (
    <Pagination className="w-full">
      <div
        className={`flex flex-col items-center justify-between w-full gap-4 ${
          compact ? "" : "sm:flex-row"
        }`}
      >
        <p className="text-(--secondary-color) text-sm font-medium opacity-80 select-none text-center">
          Showing {startEntry} to {endEntry} of {totalItems} entities
        </p>

        <PaginationContent className="flex flex-wrap items-center justify-center gap-2">
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={handlePrevious}
              className={`h-9 px-3 rounded-xl border border-gray-100 font-medium text-sm transition-colors ${
                currentPage === 1
                  ? "opacity-40 pointer-events-none bg-gray-50 text-gray-400"
                  : "bg-gray-50 text-(--secondary-color) hover:bg-gray-100"
              }`}
            />
          </PaginationItem>

          {renderPageLinks()}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={handleNext}
              className={`h-9 px-3 rounded-xl border border-gray-100 font-medium text-sm transition-colors ${
                currentPage === totalPages
                  ? "opacity-40 pointer-events-none bg-gray-50 text-gray-400"
                  : "bg-gray-50 text-(--secondary-color) hover:bg-gray-100"
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </div>
    </Pagination>
  );
}
