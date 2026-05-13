"use client";

import * as React from "react";
import {
  CircleCheckIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  getTrainingResponseMessage,
  retrainModel,
} from "@/services/trainingService";

type RetrainStatus = {
  message: string;
  type: "error" | "success";
};

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Gagal menjalankan retrain model.";
}

export function RetrainCard() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState<RetrainStatus | null>(null);

  const handleRetrain = React.useCallback(async () => {
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await retrainModel();

      setStatus({
        message: getTrainingResponseMessage(response),
        type: "success",
      });
    } catch (error) {
      setStatus({
        message: getErrorMessage(error),
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid gap-1">
            <CardTitle>Retrain Model</CardTitle>
            <CardDescription>
              Jalankan ulang pelatihan model prediksi penjualan.
            </CardDescription>
          </div>
          <Button
            type="button"
            onClick={handleRetrain}
            disabled={isSubmitting}
            className="w-full sm:w-fit"
          >
            <RefreshCwIcon className={cn(isSubmitting && "animate-spin")} />
            {isSubmitting ? "Memproses..." : "Retrain"}
          </Button>
        </div>
      </CardHeader>

      {status ? (
        <CardContent>
          <div
            role="status"
            aria-live="polite"
            className={cn(
              "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
              status.type === "success"
                ? "border-foreground/10 bg-muted/40 text-foreground"
                : "border-destructive/20 bg-destructive/10 text-destructive",
            )}
          >
            {status.type === "success" ? (
              <CircleCheckIcon className="mt-0.5 size-4 shrink-0" />
            ) : (
              <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
            )}
            <span>{status.message}</span>
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}
