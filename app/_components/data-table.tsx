"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  type OnChangeFn,
  type PaginationState,
  type Row,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "@/app/_components/data-table-pagination";

type DataTableProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  emptyMessage?: string;
  getRowId?: (
    originalRow: TData,
    index: number,
    parent?: Row<TData>,
  ) => string;
  manualPagination?: boolean;
  onPaginationChange?: OnChangeFn<PaginationState>;
  pageCount?: number;
  pageSizeOptions?: number[];
  pagination?: PaginationState;
  rowCount?: number;
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

export function DataTable<TData>({
  columns,
  data,
  emptyMessage = "No results.",
  getRowId,
  manualPagination = false,
  onPaginationChange,
  pageCount,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  pagination,
  rowCount,
}: DataTableProps<TData>) {
  const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const resolvedPagination = pagination ?? internalPagination;
  const resolvedOnPaginationChange =
    onPaginationChange ?? setInternalPagination;
  const totalRows = rowCount ?? data.length;

  const table = useReactTable({
    data,
    columns,
    ...(getRowId ? { getRowId } : {}),
    state: { pagination: resolvedPagination },
    onPaginationChange: resolvedOnPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    ...(manualPagination
      ? {}
      : {
          getPaginationRowModel: getPaginationRowModel(),
        }),
    manualPagination,
    pageCount,
    rowCount: totalRows,
  });

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        table={table}
        totalRows={totalRows}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
}
