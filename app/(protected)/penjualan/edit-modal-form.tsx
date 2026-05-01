"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/services/productService";
import type { Stock } from "@/services/stockService";

type StockEditFormState = {
  closing_stock: string;
  date: string;
  opening_stock: string;
  product_id: string;
};

type ApiResponse = {
  message?: string;
  success?: boolean;
};

type StockEditModalFormProps = {
  dateMode?: "custom" | "today";
  onOpenChange: (open: boolean) => void;
  open: boolean;
  products: Product[];
  stock: Stock;
};

function toDateInputValue(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function getInitialFormState(stock: Stock): StockEditFormState {
  return {
    closing_stock:
      stock.closing_stock === null ? "" : String(stock.closing_stock),
    date: toDateInputValue(stock.date),
    opening_stock: String(stock.opening_stock),
    product_id: stock.product_id,
  };
}

async function updateStock(stockId: string, payload: StockEditFormState) {
  const openingStock = Number(payload.opening_stock);
  const closingStock =
    payload.closing_stock.trim() === ""
      ? null
      : Number(payload.closing_stock);

  const response = await fetch(`/api/stocks/${stockId}`, {
    body: JSON.stringify({
      closing_stock: closingStock,
      date: payload.date,
      opening_stock: openingStock,
      product_id: payload.product_id,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });
  const result = (await response.json()) as ApiResponse;

  if (!response.ok || result.success === false) {
    throw new Error(result.message ?? "Gagal mengupdate penjualan.");
  }

  return result;
}

export function StockEditModalForm({
  dateMode = "custom",
  onOpenChange,
  open,
  products,
  stock,
}: StockEditModalFormProps) {
  const router = useRouter();
  const [form, setForm] = React.useState<StockEditFormState>(() =>
    getInitialFormState(stock),
  );
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isTodayOnly = dateMode === "today";

  function handleNumberChange(
    field: "closing_stock" | "opening_stock",
    value: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function validateForm() {
    const openingStock = Number(form.opening_stock);
    const closingStock =
      form.closing_stock.trim() === "" ? null : Number(form.closing_stock);

    if (!form.product_id) {
      return "Produk wajib dipilih.";
    }

    if (!form.date) {
      return "Tanggal wajib diisi.";
    }

    if (
      !Number.isInteger(openingStock) ||
      openingStock < 0 ||
      form.opening_stock.trim() === ""
    ) {
      return "Stok awal harus berupa angka bulat dan tidak boleh negatif.";
    }

    if (
      closingStock !== null &&
      (!Number.isInteger(closingStock) || closingStock < 0)
    ) {
      return "Stok akhir harus berupa angka bulat dan tidak boleh negatif.";
    }

    if (closingStock !== null && closingStock > openingStock) {
      return "Stok akhir tidak boleh lebih besar dari stok awal.";
    }

    return "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const validationMessage = validateForm();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      await updateStock(stock.id, form);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal mengupdate penjualan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isSubmitting) {
          return;
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit Penjualan</DialogTitle>
            <DialogDescription>Perbarui data penjualan produk.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`stock-product-${stock.id}`}>Produk</Label>
              <Select
                value={form.product_id}
                onValueChange={(value) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    product_id: value,
                  }))
                }
                disabled={isSubmitting || products.length === 0}
              >
                <SelectTrigger id={`stock-product-${stock.id}`} className="w-full">
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`stock-date-${stock.id}`}>Tanggal</Label>
              <Input
                id={`stock-date-${stock.id}`}
                name="date"
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    date: event.target.value,
                  }))
                }
                disabled={isSubmitting || isTodayOnly}
                readOnly={isTodayOnly}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`opening-stock-${stock.id}`}>Stok Awal</Label>
              <Input
                id={`opening-stock-${stock.id}`}
                name="opening_stock"
                type="number"
                min={0}
                step={1}
                value={form.opening_stock}
                onChange={(event) =>
                  handleNumberChange("opening_stock", event.target.value)
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`closing-stock-${stock.id}`}>Stok Akhir</Label>
              <Input
                id={`closing-stock-${stock.id}`}
                name="closing_stock"
                type="number"
                min={0}
                step={1}
                value={form.closing_stock}
                onChange={(event) =>
                  handleNumberChange("closing_stock", event.target.value)
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || products.length === 0}>
              {isSubmitting ? "Mengupdate..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
