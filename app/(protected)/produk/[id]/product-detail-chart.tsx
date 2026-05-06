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
import { ProductForecastInfo } from "./product-forecast-info";

const chartConfig = {
  actual: {
    label: "Terjual",
    color: "var(--primary)",
  },
  forecast: {
    label: "Prediksi",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

type SoldChartItem = {
  date: string;
  actual?: number;
  forecast?: number;
  forecastBridge?: number;
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

function getLastActualData(data: SoldChartItem[]) {
  return data.reduce<SoldChartItem | null>((latest, item) => {
    if (!latest) {
      return item;
    }

    return new Date(item.date).getTime() > new Date(latest.date).getTime()
      ? item
      : latest;
  }, null);
}

export function ProductDetailChart({
  productId,
  productName,
  salesHistoryCount,
}: ProductDetailChartProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState<TimeRange | null>(null);
  const [chartData, setChartData] = React.useState<SoldChartItem[]>([]);
  const [forecastDetails, setForecastDetails] = React.useState<SoldChartItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [forecastNotice, setForecastNotice] = React.useState<string | null>(
    null,
  );

  const selectedTimeRange = timeRange ?? (isMobile ? "7d" : "90d");
  const forecastDescription =
    salesHistoryCount >= minimumForecastDays
      ? forecastDetails.length > 0
        ? ` dan ${forecastDetails.length} data prediksi ke depan dari AI.`
        : " dan prediksi ke depan dari AI."
      : ". Prediksi tampil setelah minimum 22 hari data penjualan.";

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
        const lastActualData = getLastActualData(actualData);
        const lastActualTime = lastActualData
          ? new Date(lastActualData.date).getTime()
          : null;

        let normalizedForecasts: SoldChartItem[] = [];
        let forecastDataForChart: SoldChartItem[] = [];
        let forecastBridgeData: SoldChartItem[] = [];

        if (salesHistoryCount >= minimumForecastDays) {
          try {
            const forecastResponse = await getProductForecast(productId);

            normalizedForecasts = (forecastResponse.forecasts ?? [])
              .map((item) => ({
                date: normalizeDate(item.date),
                forecast: item.prediction,
              }))
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime(),
              );

            forecastDataForChart = normalizedForecasts.filter((item) => {
              const forecastTime = new Date(item.date).getTime();

              return (
                !actualDates.has(item.date) &&
                (lastActualTime === null || forecastTime > lastActualTime)
              );
            });

            const firstForecast = forecastDataForChart[0];

            if (
              lastActualData?.actual !== undefined &&
              firstForecast?.forecast !== undefined
            ) {
              forecastBridgeData = [
                {
                  date: lastActualData.date,
                  forecastBridge: lastActualData.actual,
                },
                {
                  date: firstForecast.date,
                  forecastBridge: firstForecast.forecast,
                },
              ];
            }
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
          mergedDataMap.set(item.date, {
            ...mergedDataMap.get(item.date),
            ...item,
          });
        });

        forecastBridgeData.forEach((item) => {
          mergedDataMap.set(item.date, {
            ...mergedDataMap.get(item.date),
            ...item,
          });
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
              {forecastDescription}
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
          <AreaChart
            data={chartData}
            margin={{ top: 12, right: 16, left: 8, bottom: 0 }}
          >
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
              <linearGradient id="fillForecast" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-forecast)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-forecast)"
                  stopOpacity={0.06}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              padding={{ left: 8, right: 8 }}
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
              type="monotone"
              fill="url(#fillActual)"
              stroke="var(--color-actual)"
              strokeWidth={2}
              isAnimationActive
              connectNulls={false}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              dataKey="forecastBridge"
              type="monotone"
              fill="none"
              stroke="var(--color-forecast)"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              isAnimationActive
              connectNulls
              tooltipType="none"
              legendType="none"
              dot={false}
            />
            <Area
              dataKey="forecast"
              type="monotone"
              fill="url(#fillForecast)"
              stroke="var(--color-forecast)"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              isAnimationActive
              connectNulls={false}
              dot={{ r: 2.5, strokeWidth: 2 }}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>

        <ProductForecastInfo
          forecastDetails={forecastDetails}
          forecastNotice={forecastNotice}
          isLoading={isLoading}
          error={error}
          hasChartData={chartData.length > 0}
        />
      </CardContent>
    </Card>
  );
}
