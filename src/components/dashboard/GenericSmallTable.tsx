"use client";

import React from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight2 } from "iconsax-react";
import Link from "next/link";

export interface ColumnDef<T> {
  header: string; // The text at the top of the column
  accessorKey?: keyof T; // The key in your data object (e.g., 'name', 'email')
  width?: string; // Optional column width, e.g. '160px' or '12rem'
  render?: (item: T, index: number) => React.ReactNode;
}

// 2. Define the props for the table itself
interface GenericTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
}

// 3. Build the Component
export default function GenericSmallTable<T>({
  data,
  columns,
}: GenericTableProps<T>) {
  return (
    <div className="bg-white justify-center p-5 h-full w-full rounded-[20px] box-shadow">
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-lg font-bold secondary-color">
          Recent Pending Event
        </h2>

        <Link
          href="/moderator/event-submissions"
          className="text-xs sm:text-sm font-normal text-gray-700 flex items-center gap-1 hover:text-[var(--main-color)] transition group whitespace-nowrap"
        >
          <span>View more</span>

          <ArrowRight2
            size={12}
            color="currentColor"
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <Table>
          {/* Render Headers */}
          <TableHeader>
            <TableRow className="bg-background hover:bg-background border-slate-200">
              {columns.map((col, index) => (
                <TableHead
                  key={index}
                  className=" px-5 py-3 font-semibold text-md secondary-color "
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          {/* Render Body */}
          <TableBody>
            {data.length > 0 ? (
              data.map((rowItem, rowIndex) => (
                <TableRow key={rowIndex} className=" border-slate-200 ">
                  {columns.map((col, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className="py-2 px-5 text-slate-700 text-sm"
                      style={col.width ? { width: col.width } : undefined}
                    >
                      {col.render
                        ? col.render(rowItem, rowIndex)
                        : col.accessorKey
                          ? String(rowItem[col.accessorKey])
                          : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-slate-500"
                >
                  No data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
