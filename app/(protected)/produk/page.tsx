"use client";

import { DataTable } from "@/app/_components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  image?: string;
};

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Nama Produk",
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const image = row.original.image;

      if (!image) {
        return <span className="text-muted-foreground">No Image</span>;
      }

      return (
        <Image
          width={300}
          height={300}
          src={image}
          alt={row.original.name}
          className="w-12 h-12 object-cover rounded-md"
        />
      );
    },
  },
];

export default function Page() {
  const data: Product[] = [
    {
      id: "1",
      name: "Nasi Goreng",
      image:
        "https://plus.unsplash.com/premium_photo-1776472294570-9090932e7aa2?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: "2",
      name: "Mie Ayam",
      image:
        "https://plus.unsplash.com/premium_photo-1776472294570-9090932e7aa2?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: "3",
      name: "Bakso",
      image:
        "https://plus.unsplash.com/premium_photo-1776472294570-9090932e7aa2?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: "3",
      name: "Bakso",
      image:
        "https://plus.unsplash.com/premium_photo-1776472294570-9090932e7aa2?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: "3",
      name: "Bakso",
      image:
        "https://plus.unsplash.com/premium_photo-1776472294570-9090932e7aa2?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: "3",
      name: "Bakso",
      image:
        "https://plus.unsplash.com/premium_photo-1776472294570-9090932e7aa2?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: "3",
      name: "Bakso",
      image:
        "https://plus.unsplash.com/premium_photo-1776472294570-9090932e7aa2?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: "3",
      name: "Bakso",
      image:
        "https://plus.unsplash.com/premium_photo-1776472294570-9090932e7aa2?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: "3",
      name: "Bakso",
      image:
        "https://plus.unsplash.com/premium_photo-1776472294570-9090932e7aa2?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: "3",
      name: "Bakso",
      image:
        "https://plus.unsplash.com/premium_photo-1776472294570-9090932e7aa2?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: "3",
      name: "Bakso",
      image:
        "https://plus.unsplash.com/premium_photo-1776472294570-9090932e7aa2?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: "3",
      name: "Bakso",
      image:
        "https://plus.unsplash.com/premium_photo-1776472294570-9090932e7aa2?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    { id: "3", name: "Bakso" },
    { id: "3", name: "Bakso" },
    { id: "3", name: "Bakso" },
    { id: "3", name: "Bakso" },
    { id: "3", name: "Bakso" },
    { id: "3", name: "Bakso" },
    { id: "3", name: "Bakso" },
    { id: "3", name: "Bakso" },
  ];

  return (
    <div className="p-5">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
