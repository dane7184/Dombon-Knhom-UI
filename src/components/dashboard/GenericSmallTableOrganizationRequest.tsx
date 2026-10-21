"use client";

import React from "react";
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
  header: string;
  accessorKey?: keyof T;
  width?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface GenericTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
}

export default function GenericSmallTableOrganizationRequest<T>({
  data,
  columns,
}: GenericTableProps<T>) {
  return (
    <div className="bg-white overflow-hidden justify-center p-3 w-full rounded-[20px] flex flex-col">
      <div className="flex items-center justify-between pb-4 shrink-0">
        <h2 className="text-lg font-bold secondary-color">
          Organization Requests
        </h2>

        <Link
          href="/moderator/organization-requests"
          className="text-xs sm:text-sm font-normal text-(--secondary-color) flex items-center gap-1 hover:text-(--main-color) transition group whitespace-nowrap"
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
              data.slice(0, 6).map((rowItem, rowIndex) => (
                <TableRow key={rowIndex} className=" border-slate-200 ">
                  {columns.map((col, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className="py-2 px-5 text-(--secondary-color) text-sm"
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
