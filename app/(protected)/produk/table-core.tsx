"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  ColumnDef,
  OnChangeFn,
  PaginationState,
} from "@tanstack/react-table";

import { DataTable } from "@/app/_components/data-table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import type { Product, ProductResponse } from "@/services/productService";

type ProductTableProps = {
  data: Product[];
  meta: ProductResponse["meta"];
  pageSizeOptions?: number[];
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getImageSrc(value: string | null) {
  if (!value) {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  if (
    trimmedValue.startsWith("/") ||
    trimmedValue.startsWith("http://") ||
    trimmedValue.startsWith("https://") ||
    trimmedValue.startsWith("data:") ||
    trimmedValue.startsWith("blob:")
  ) {
    return trimmedValue;
  }

  return `/${trimmedValue}`;
}

export function ProductTable({
  data,
  meta,
  pageSizeOptions = [10, 20, 30, 40],
}: ProductTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const pagination = React.useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max(meta.page - 1, 0),
      pageSize: meta.limit,
    }),
    [meta.limit, meta.page],
  );

  const columns = React.useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: "number",
        header: "No",
        cell: ({ row }) => (meta.page - 1) * meta.limit + row.index + 1,
      },
      {
        accessorKey: "name",
        header: "Nama Produk",
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-9 rounded-md">
              <AvatarImage
                src={getImageSrc(row.original.image)}
                alt={row.original.name}
              />
              <AvatarFallback className="rounded-md text-xs">
                {getInitials(row.original.name) || "PR"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate font-medium">{row.original.name}</div>
              <div className="text-xs text-muted-foreground">
                ID: {row.original.id}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Dibuat",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        accessorKey: "updated_at",
        header: "Diperbarui",
        cell: ({ row }) => formatDate(row.original.updated_at),
      },
    ],
    [meta.limit, meta.page],
  );

  const handlePaginationChange = React.useCallback<
    OnChangeFn<PaginationState>
  >(
    (updater) => {
      const nextPagination =
        typeof updater === "function" ? updater(pagination) : updater;

      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(nextPagination.pageIndex + 1));
      params.set("limit", String(nextPagination.pageSize));

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pagination, pathname, router, searchParams],
  );

  return (
    <div aria-busy={isPending} className={isPending ? "opacity-60" : ""}>
      <DataTable
        columns={columns}
        data={data}
        emptyMessage="Belum ada produk."
        getRowId={(row) => row.id}
        manualPagination
        onPaginationChange={handlePaginationChange}
        pageCount={Math.max(meta.totalPages, 1)}
        pageSizeOptions={pageSizeOptions}
        pagination={pagination}
        rowCount={meta.total}
      />
    </div>
  );
}
