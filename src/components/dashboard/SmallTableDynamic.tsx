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

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  width?: string;
  render?: (item: T) => React.ReactNode;
}

interface SmallTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
}

export default function SmallTableDynamic<T>({
  data,
  columns,
}: SmallTableProps<T>) {
  return (
    <div className="flex flex-col w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
      {/* 2. CHANGE THIS LINE: Add a specific min-width matching your column profiles (e.g., min-w-[600px]) */}
      <div className="w-full bg-white border-b border-slate-200 z-10 min-w-[200]">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-background hover:bg-white border-none">
              {columns.map((col, index) => (
                <TableHead
                  key={index}
                  className="px-4 py-3 font-semibold text-sm secondary-color bg-background"
                  style={
                    col.width
                      ? {
                          width: col.width,
                          minWidth: col.width,
                          maxWidth: col.width,
                        }
                      : undefined
                  }
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      {/* BODY (scrollable like main table) */}
      <div className="flex-1 overflow-y-auto scroll-containe scroll-auto  no-scrollbar w-full min-w-[200px]">
        <Table className="table-fixed">
          <TableBody>
            {data.length > 0 ? (
              data.map((rowItem, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="border-slate-200 hover:bg-slate-50/50"
                >
                  {columns.map((col, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className="py-2 px-4 text-slate-700 text-sm"
                      style={
                        col.width
                          ? {
                              width: col.width,
                              minWidth: col.width,
                              maxWidth: col.width,
                            }
                          : undefined
                      }
                    >
                      {col.render
                        ? col.render(rowItem)
                        : col.accessorKey
                          ? (
                            <span
                              className="block truncate"
                              title={String(rowItem[col.accessorKey])}
                            >
                              {String(rowItem[col.accessorKey])}
                            </span>
                          )
                          : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-20 text-center text-slate-500 text-sm"
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
