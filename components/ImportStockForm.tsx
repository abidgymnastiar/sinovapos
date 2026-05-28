"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ImportStockResult = {
  success: boolean;
  imported: number;
  skipped: number;
  duplicates: number;
  errors: string[];
};

const emptyResult: ImportStockResult = {
  duplicates: 0,
  errors: [],
  imported: 0,
  skipped: 0,
  success: false,
};

export function ImportStockForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportStockResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setResult({
        ...emptyResult,
        errors: ["File wajib ada"],
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/import-stock", {
        body: formData,
        method: "POST",
      });
      const payload = (await response.json()) as Partial<ImportStockResult>;

      setResult({
        duplicates: payload.duplicates ?? 0,
        errors: Array.isArray(payload.errors) ? payload.errors : [],
        imported: payload.imported ?? 0,
        skipped: payload.skipped ?? 0,
        success: response.ok && payload.success === true,
      });

      if (response.ok && payload.success === true) {
        setSelectedFile(null);
        router.refresh();

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error: unknown) {
      setResult({
        ...emptyResult,
        errors: [
          error instanceof Error ? error.message : "Gagal mengimport stock",
        ],
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="stock-excel-file">File Excel</Label>
          <Input
            ref={fileInputRef}
            accept=".xlsx,.xls"
            disabled={isLoading}
            id="stock-excel-file"
            name="file"
            onChange={(event) => {
              setSelectedFile(event.target.files?.[0] ?? null);
              setResult(null);
            }}
            type="file"
          />
        </div>

        <Button className="w-fit" disabled={isLoading} type="submit">
          {isLoading ? <Loader2 className="animate-spin" /> : <Upload />}
          {isLoading ? "Mengimport..." : "Import"}
        </Button>
      </form>

      {result ? (
        <div className="space-y-4" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">Imported</p>
              <p className="text-2xl font-semibold">{result.imported}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">Skipped</p>
              <p className="text-2xl font-semibold">{result.skipped}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">Duplicates</p>
              <p className="text-2xl font-semibold">{result.duplicates}</p>
            </div>
          </div>

          {result.errors.length > 0 ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
              <p className="font-medium text-destructive">Errors</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {result.errors.map((error, index) => (
                  <li key={`${error}-${index}`}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
