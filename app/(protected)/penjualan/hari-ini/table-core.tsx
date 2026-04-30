"use client";

import * as React from "react";
import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/app/_components/data-table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import type { Product } from "@/services/productService";
import type { Stock } from "@/services/stockService";

const PRODUCT_FALLBACK_IMAGE = "/notFound.png";

type StockTodayTableProps = {
  data: Stock[];
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

function ProductCell({ product }: { product: Product }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="size-10 rounded-md border bg-muted">
        <AvatarImage
          src={getImageSrc(product.image)}
          alt={`Gambar ${product.name}`}
          className="object-cover"
        />
        <AvatarFallback className="rounded-md">
          <Image
            src={PRODUCT_FALLBACK_IMAGE}
            alt="Gambar produk tidak ditemukan"
            width={40}
            height={40}
            className="size-10 object-cover"
          />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="truncate font-medium">{product.name}</div>
        <div className="text-xs text-muted-foreground">ID: {product.id}</div>
      </div>
    </div>
  );
}

export function StockTodayTable({ data }: StockTodayTableProps) {
  const columns = React.useMemo<ColumnDef<Stock>[]>(
    () => [
      {
        id: "number",
        header: "No",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "product.name",
        header: "Nama Produk",
        cell: ({ row }) => <ProductCell product={row.original.product} />,
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
      emptyMessage="Belum ada penjualan hari ini."
      getRowId={(row) => row.id}
      pageSizeOptions={[10, 20, 30, 40]}
    />
  );
}
