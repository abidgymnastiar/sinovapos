"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

type ProductFormState = {
  image: File | null;
  name: string;
};

type ApiResponse = {
  message?: string;
  success?: boolean;
};

const initialFormState: ProductFormState = {
  image: null,
  name: "",
};

async function createProduct(payload: ProductFormState) {
  const formData = new FormData();
  formData.append("name", payload.name.trim());

  if (payload.image) {
    formData.append("image", payload.image);
  }

  const response = await fetch("/api/products", {
    method: "POST",
    body: formData,
  });

  const result = (await response.json()) as ApiResponse;

  if (!response.ok || result.success === false) {
    throw new Error(result.message ?? "Gagal menyimpan produk.");
  }

  return result;
}

export function ProductModalForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<ProductFormState>(initialFormState);
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

  function resetForm() {
    setForm(initialFormState);
    setErrorMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function refreshFirstPage() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`);
    router.refresh();
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
      await createProduct(form);
      resetForm();
      setOpen(false);
      refreshFirstPage();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menyimpan produk.",
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
        label="Tambah Produk"
        icon={<PlusIcon className="h-4 w-4" />}
        onClick={() => setOpen(true)}
      />

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Tambah Produk</DialogTitle>
            <DialogDescription>
              Simpan produk baru ke daftar produk.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="product-name">Nama Produk</Label>
              <Input
                id="product-name"
                name="name"
                value={form.name}
                onChange={handleNameChange}
                placeholder="Nasi Goreng"
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="product-image">Upload Image</Label>
              <Input
                ref={fileInputRef}
                id="product-image"
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
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
