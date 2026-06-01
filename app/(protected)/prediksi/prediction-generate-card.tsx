"use client";

import * as React from "react";
import { CalendarDaysIcon, FileJsonIcon, Loader2Icon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generatePrediction } from "@/services/predictionService";

import { predictionMonths } from "./prediction-constants";

type GenerateStatus = {
  generatedAt: string | null;
  message: string;
  productsCount: number;
  type: "success" | "error";
};

export function PredictionGenerateCard() {
  const currentDate = new Date();
  const [month, setMonth] = React.useState(String(currentDate.getMonth() + 1));
  const [year, setYear] = React.useState(String(currentDate.getFullYear()));
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState<GenerateStatus | null>(null);

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedMonth = Number(month);
    const parsedYear = Number(year);

    if (!parsedMonth || !parsedYear) {
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await generatePrediction({
        month: parsedMonth,
        year: parsedYear,
      });

      setStatus({
        generatedAt: response.generated_at,
        message: `JSON prediksi ${predictionMonths[parsedMonth - 1]} ${parsedYear} siap digunakan.`,
        productsCount: response.products.length,
        type: "success",
      });
    } catch (error) {
      setStatus({
        generatedAt: null,
        message:
          error instanceof Error ? error.message : "Gagal generate prediksi.",
        productsCount: 0,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid gap-1">
            <CardTitle>Generate Prediksi</CardTitle>
            <CardDescription>Buat JSON prediksi bulanan.</CardDescription>
          </div>

          <Badge variant="outline" className="h-6 rounded-md px-2.5">
            /predictions/generate
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="border-t pt-5">
        <form
          onSubmit={handleGenerate}
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem_10rem_auto] lg:items-end"
        >
          <div className="grid gap-1 rounded-md border bg-muted/30 px-3 py-2">
            <p className="text-sm font-medium">File Prediksi</p>
            <p className="text-sm text-muted-foreground">
              Endpoint ini hanya membuat data JSON prediksi.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="generate-month">Bulan</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger id="generate-month" className="w-full">
                <CalendarDaysIcon />
                <SelectValue placeholder="Pilih bulan" />
              </SelectTrigger>
              <SelectContent>
                {predictionMonths.map((monthName, index) => (
                  <SelectItem key={monthName} value={String(index + 1)}>
                    {monthName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="generate-year">Tahun</Label>
            <Input
              id="generate-year"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              inputMode="numeric"
              max={2100}
              min={1900}
              type="number"
            />
          </div>

          <Button type="submit" className="w-full lg:w-fit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <FileJsonIcon />
            )}
            {isSubmitting ? "Generate..." : "Generate JSON"}
          </Button>
        </form>

        {status ? (
          <div
            className={
              status.type === "success"
                ? "mt-4 rounded-md border bg-muted/30 px-3 py-2 text-sm"
                : "mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            }
          >
            <p className="font-medium">{status.message}</p>
            {status.type === "success" ? (
              <p className="text-muted-foreground">
                {status.productsCount} produk, generated at{" "}
                {status.generatedAt ?? "-"}.
              </p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
