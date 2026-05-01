"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  ActionMenu,
  type ActionMenuItem,
} from "@/app/_components/action-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/services/productService";
import type { Stock } from "@/services/stockService";

import { StockEditModalForm } from "./edit-modal-form";

type ApiResponse = {
  message?: string;
  success?: boolean;
};

type StockActionMenuProps = {
  dateMode?: "custom" | "today";
  products: Product[];
  stock: Stock;
};

async function deleteStock(stockId: string) {
  const response = await fetch(`/api/stocks/${stockId}`, {
    method: "DELETE",
  });
  const responseText = await response.text();
  let result: ApiResponse = { success: response.ok };

  if (responseText) {
    try {
      result = JSON.parse(responseText) as ApiResponse;
    } catch {
      result = {
        message: responseText,
        success: response.ok,
      };
    }
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message ?? "Gagal menghapus penjualan.");
  }

  return result;
}

export function StockActionMenu({
  dateMode = "custom",
  products,
  stock,
}: StockActionMenuProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = React.useCallback(async () => {
    setDeleteError("");
    setIsDeleting(true);

    try {
      await deleteStock(stock.id);
      setDeleteOpen(false);
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Gagal menghapus penjualan.",
      );
    } finally {
      setIsDeleting(false);
    }
  }, [router, stock.id]);

  const items = React.useMemo<ActionMenuItem[]>(
    () => [
      {
        label: "Edit",
        onSelect: () => setEditOpen(true),
      },
      {
        disabled: isDeleting,
        label: isDeleting ? "Menghapus..." : "Hapus",
        onSelect: () => setDeleteOpen(true),
        separatorBefore: true,
        variant: "destructive",
      },
    ],
    [isDeleting],
  );

  return (
    <>
      <ActionMenu
        items={items}
        label={`Buka menu aksi penjualan ${stock.product.name}`}
      />
      {editOpen ? (
        <StockEditModalForm
          dateMode={dateMode}
          onOpenChange={setEditOpen}
          open={editOpen}
          products={products}
          stock={stock}
        />
      ) : null}
      <Dialog
        open={deleteOpen}
        onOpenChange={(nextOpen) => {
          if (isDeleting) {
            return;
          }

          setDeleteOpen(nextOpen);

          if (!nextOpen) {
            setDeleteError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Penjualan</DialogTitle>
            <DialogDescription>
              Data penjualan {stock.product.name} akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>

          {deleteError ? (
            <p className="text-sm text-destructive">{deleteError}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
