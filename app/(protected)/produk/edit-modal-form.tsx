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
import type { Product } from "@/services/productService";

type ProductEditFormState = {
  image: File | null;
  name: string;
};

type ApiResponse = {
  message?: string;
  success?: boolean;
};

type ProductEditModalFormProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  product: Product;
};

function getInitialFormState(product: Product): ProductEditFormState {
  return {
    image: null,
    name: product.name,
  };
}

async function updateProduct(productId: string, payload: ProductEditFormState) {
  const formData = new FormData();
  formData.append("name", payload.name.trim());

  if (payload.image) {
    formData.append("image", payload.image);
  }

  const response = await fetch(`/api/products/${productId}`, {
    body: formData,
    method: "PUT",
  });

  const result = (await response.json()) as ApiResponse;

  if (!response.ok || result.success === false) {
    throw new Error(result.message ?? "Gagal mengupdate produk.");
  }

  return result;
}

export function ProductEditModalForm({
  onOpenChange,
  open,
  product,
}: ProductEditModalFormProps) {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [form, setForm] = React.useState<ProductEditFormState>(() =>
    getInitialFormState(product),
  );
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setForm((currentForm) => ({
      ...currentForm,
      name: event.target.value,
    }));
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    setForm((currentForm) => ({
      ...currentForm,
      image: event.target.files?.[0] ?? null,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!form.name.trim()) {
      setErrorMessage("Nama produk wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProduct(product.id, form);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal mengupdate produk.",
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
            <DialogTitle>Edit Produk</DialogTitle>
            <DialogDescription>Perbarui data produk.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`product-name-${product.id}`}>
                Nama Produk
              </Label>
              <Input
                id={`product-name-${product.id}`}
                name="name"
                value={form.name}
                onChange={handleNameChange}
                placeholder="Nasi Goreng"
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`product-image-${product.id}`}>
                Upload Image
              </Label>
              <Input
                ref={fileInputRef}
                id={`product-image-${product.id}`}
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Mengupdate..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
