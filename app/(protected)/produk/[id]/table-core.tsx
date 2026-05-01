"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/app/_components/data-table";
import type { ProductStock } from "@/services/productService";

type ProductStockTableProps = {
  data: ProductStock[];
};

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

export function ProductStockTable({ data }: ProductStockTableProps) {
  const columns = React.useMemo<ColumnDef<ProductStock>[]>(
    () => [
      {
        id: "number",
        header: "No",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "date",
        header: "Tanggal",
        cell: ({ row }) => formatDate(row.original.date),
      },
      {
        accessorKey: "opening_stock",
        header: "Stok Awal",
      },
      {
        accessorKey: "closing_stock",
        header: "Stok Akhir",
        cell: ({ row }) => row.original.closing_stock ?? "-",
      },
      {
        accessorKey: "sold",
        header: "Terjual",
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="Belum ada data stok untuk produk ini."
      getRowId={(row) => row.id}
      pageSizeOptions={[10, 20, 30, 40]}
    />
  );
}
