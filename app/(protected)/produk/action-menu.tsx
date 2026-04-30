"use client";

import * as React from "react";

import {
  ActionMenu,
  type ActionMenuItem,
} from "@/app/_components/action-menu";
import type { Product } from "@/services/productService";

import { ProductEditModalForm } from "./edit-modal-form";

type ProductActionMenuProps = {
  product: Product;
};

export function ProductActionMenu({ product }: ProductActionMenuProps) {
  const [editOpen, setEditOpen] = React.useState(false);
  const items = React.useMemo<ActionMenuItem[]>(
    () => [
      {
        label: "Selengkapnya",
      },
      {
        label: "Edit",
        onSelect: () => setEditOpen(true),
      },
      {
        label: "Delete",
        separatorBefore: true,
        variant: "destructive",
      },
    ],
    [],
  );

  return (
    <>
      <ActionMenu
        items={items}
        label={`Buka menu aksi produk ${product.name}`}
      />
      {editOpen ? (
        <ProductEditModalForm
          open={editOpen}
          onOpenChange={setEditOpen}
          product={product}
        />
      ) : null}
    </>
  );
}
