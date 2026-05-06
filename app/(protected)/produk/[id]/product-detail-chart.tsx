"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ChartFilter } from "@/app/_components/line-chart/chart-filter";
import type { TimeRange } from "@/app/_components/line-chart/chart-types";
import { getDashboardProductSales } from "@/services/dashboardService";
import { getProductForecast } from "@/services/forecastService";

const chartConfig = {
  actual: {
    label: "Actual Sold",
    color: "var(--primary)",
  },
  forecast: {
    label: "Forecast",
    color: "var(--destructive)",
  },
} satisfies ChartConfig;

type SoldChartItem = {
  date: string;
  actual?: number;
  forecast?: number;
};

type ProductDetailChartProps = {
  productId: string;
  productName: string;
  salesHistoryCount: number;
};

const minimumForecastDays = 22;

const daysMap: Record<TimeRange, number> = {
  "90d": 90,
  "30d": 30,
  "7d": 7,
};

function normalizeDate(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getForecastRequirementMessage(salesHistoryCount: number) {
  if (salesHistoryCount > 0) {
    return `Prediksi belum tersedia karena data penjualan baru ${salesHistoryCount} hari. Minimum ${minimumForecastDays} hari.`;
  }

  return `Prediksi belum tersedia karena belum ada data penjualan. Minimum ${minimumForecastDays} hari.`;
}

export function ProductDetailChart({
  productId,
  productName,
  salesHistoryCount,
}: ProductDetailChartProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState<TimeRange | null>(null);
  const [chartData, setChartData] = React.useState<SoldChartItem[]>([]);
  const [forecastDetails, setForecastDetails] = React.useState<SoldChartItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [forecastNotice, setForecastNotice] = React.useState<string | null>(
    null,
  );

  const selectedTimeRange = timeRange ?? (isMobile ? "7d" : "90d");
  const forecastStartDate = forecastDetails[0]?.date;
  const forecastEndDate = forecastDetails[forecastDetails.length - 1]?.date;
  const forecastTotal = forecastDetails.reduce(
    (sum, item) => sum + (item.forecast ?? 0),
    0,
  );

  React.useEffect(() => {
    async function loadChartData() {
      setIsLoading(true);
      setError(null);
      setForecastNotice(null);

      const days = daysMap[selectedTimeRange];

      try {
        const salesResponse = await getDashboardProductSales(days, productId);

        const actualData: SoldChartItem[] = (salesResponse.data ?? []).map(
          (item) => ({
            date: normalizeDate(item.date),
            actual: item.sold,
          }),
        );

        const actualDates = new Set(actualData.map((item) => item.date));

        let normalizedForecasts: SoldChartItem[] = [];
        let forecastDataForChart: SoldChartItem[] = [];

        if (salesHistoryCount >= minimumForecastDays) {
          try {
            const forecastResponse = await getProductForecast(productId);

            normalizedForecasts = (forecastResponse.forecasts ?? []).map(
              (item) => ({
                date: normalizeDate(item.date),
                forecast: item.prediction,
              }),
            );

            forecastDataForChart = normalizedForecasts.filter(
              (item) => !actualDates.has(item.date),
            );
          } catch (forecastError) {
            setForecastNotice(
              getErrorMessage(forecastError, "Prediksi belum tersedia."),
            );
          }
        } else {
          setForecastNotice(getForecastRequirementMessage(salesHistoryCount));
        }

        const mergedDataMap = new Map<string, SoldChartItem>();

        actualData.forEach((item) => {
          mergedDataMap.set(item.date, item);
        });

        forecastDataForChart.forEach((item) => {
          mergedDataMap.set(item.date, item);
        });

        const sortedData = Array.from(mergedDataMap.values()).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

        setForecastDetails(normalizedForecasts);
        setChartData(sortedData);
      } catch (err) {
        setError(getErrorMessage(err, "Gagal memuat data penjualan produk."));
      } finally {
        setIsLoading(false);
      }
    }

    loadChartData();
  }, [productId, salesHistoryCount, selectedTimeRange]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{productName}</CardTitle>
            <CardDescription>
              Menampilkan data penjualan {daysMap[selectedTimeRange]} hari
              terakhir
              {salesHistoryCount >= minimumForecastDays
                ? " dan prediksi 7 hari ke depan dari AI."
                : ". Prediksi tampil setelah minimum 22 hari data penjualan."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <ChartFilter value={selectedTimeRange} onChange={setTimeRange} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-actual)"
                  stopOpacity={1}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-actual)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} horizontal={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("id-ID", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("id-ID", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="actual"
              type="natural"
              fill="url(#fillActual)"
              stroke="var(--color-actual)"
              isAnimationActive
              connectNulls={false}
            />
            <Area
              dataKey="forecast"
              type="natural"
              fill="none"
              stroke="var(--color-forecast)"
              strokeWidth={2}
              isAnimationActive
              connectNulls={true}
            />
          </AreaChart>
        </ChartContainer>

        {forecastDetails.length > 0 && forecastStartDate && forecastEndDate ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Prediksi berikutnya
                </p>
                <p className="font-semibold">
                  {new Date(forecastStartDate).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  {" - "}
                  {new Date(forecastEndDate).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Total prediksi
                </p>
                <p className="font-semibold">{forecastTotal}</p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {forecastDetails.map((item) => (
                <div
                  key={item.date}
                  className="rounded-xl bg-white px-3 py-2 shadow-sm"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {new Date(item.date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">{item.forecast}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {!isLoading && !error && forecastNotice ? (
          <div className="mt-4 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            {forecastNotice}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Loading chart data...
          </div>
        ) : error ? (
          <div className="mt-4 text-center text-sm text-destructive">
            {error}
          </div>
        ) : chartData.length === 0 ? (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            No sales data available for this product.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
