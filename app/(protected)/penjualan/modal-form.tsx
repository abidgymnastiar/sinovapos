"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { CustomButton } from "@/app/_components/custom-button";
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

const JAKARTA_TIME_ZONE = "Asia/Jakarta";

type StockFormState = {
  closing_stock: string;
  date: string;
  opening_stock: string;
  product_id: string;
};

type ApiResponse = {
  message?: string;
  success?: boolean;
};

type StockModalFormProps = {
  dateMode?: "custom" | "today";
  description?: string;
  products: Product[];
  title?: string;
};

function getDateKey(value: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
  }).formatToParts(value);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return year && month && day ? `${year}-${month}-${day}` : "";
}

function getInitialFormState(): StockFormState {
  return {
    closing_stock: "",
    date: getDateKey(new Date()),
    opening_stock: "",
    product_id: "",
  };
}

async function createStock(payload: StockFormState) {
  const openingStock = Number(payload.opening_stock);
  const closingStock =
    payload.closing_stock.trim() === ""
      ? undefined
      : Number(payload.closing_stock);
  const body: {
    closing_stock?: number;
    date: string;
    opening_stock: number;
    product_id: string;
  } = {
    date: payload.date,
    opening_stock: openingStock,
    product_id: payload.product_id,
  };

  if (closingStock !== undefined) {
    body.closing_stock = closingStock;
  }

  const response = await fetch("/api/stocks", {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const result = (await response.json()) as ApiResponse;

  if (!response.ok || result.success === false) {
    throw new Error(result.message ?? "Gagal menyimpan penjualan.");
  }

  return result;
}

export function StockModalForm({
  dateMode = "today",
  description = "Simpan data penjualan produk.",
  products,
  title = "Tambah Penjualan",
}: StockModalFormProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<StockFormState>(getInitialFormState);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isTodayOnly = dateMode === "today";

  function resetForm() {
    setForm(getInitialFormState());
    setErrorMessage("");
  }

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
      form.closing_stock.trim() === "" ? undefined : Number(form.closing_stock);

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
      closingStock !== undefined &&
      (!Number.isInteger(closingStock) || closingStock < 0)
    ) {
      return "Stok akhir harus berupa angka bulat dan tidak boleh negatif.";
    }

    if (closingStock !== undefined && closingStock > openingStock) {
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
      await createStock(form);
      resetForm();
      setOpen(false);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menyimpan penjualan.",
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

        setOpen(nextOpen);

        if (!nextOpen) {
          resetForm();
        }
      }}
    >
      <CustomButton
        label="Tambah Penjualan"
        icon={<PlusIcon className="h-4 w-4" />}
        onClick={() => setOpen(true)}
      />

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="stock-product">Produk</Label>
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
                <SelectTrigger id="stock-product" className="w-full">
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
              <Label htmlFor="stock-date">Tanggal</Label>
              <Input
                id="stock-date"
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
              <Label htmlFor="opening-stock">Stok Awal</Label>
              <Input
                id="opening-stock"
                name="opening_stock"
                type="number"
                min={0}
                step={1}
                value={form.opening_stock}
                onChange={(event) =>
                  handleNumberChange("opening_stock", event.target.value)
                }
                placeholder="100"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="closing-stock">Stok Akhir</Label>
              <Input
                id="closing-stock"
                name="closing_stock"
                type="number"
                min={0}
                step={1}
                value={form.closing_stock}
                onChange={(event) =>
                  handleNumberChange("closing_stock", event.target.value)
                }
                placeholder="80"
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
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || products.length === 0}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
