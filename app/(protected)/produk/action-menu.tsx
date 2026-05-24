"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { Product } from "@/services/productService";

import { ProductEditModalForm } from "./edit-modal-form";

type ProductActionMenuProps = {
  product: Product;
};

export function ProductActionMenu({ product }: ProductActionMenuProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/produk/${product.id}`)}
        >
          Detail
        </Button>

        <Button size="sm" onClick={() => setEditOpen(true)}>
          Edit
        </Button>
      </div>

      <ProductEditModalForm
        open={editOpen}
        onOpenChange={setEditOpen}
        product={product}
      />
    </>
  );
}
