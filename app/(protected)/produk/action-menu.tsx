"use client";

import {
  ActionMenu,
  type ActionMenuItem,
} from "@/app/_components/action-menu";
import type { Product } from "@/services/productService";

const PRODUCT_ACTION_ITEMS: ActionMenuItem[] = [
  {
    label: "Selengkapnya",
  },
  {
    label: "Edit",
  },
  {
    label: "Delete",
    separatorBefore: true,
    variant: "destructive",
  },
];

type ProductActionMenuProps = {
  product: Product;
};

export function ProductActionMenu({ product }: ProductActionMenuProps) {
  return (
    <ActionMenu
      items={PRODUCT_ACTION_ITEMS}
      label={`Buka menu aksi produk ${product.name}`}
    />
  );
}
