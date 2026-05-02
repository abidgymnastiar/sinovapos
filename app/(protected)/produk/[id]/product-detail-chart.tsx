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

const chartConfig = {
  sold: {
    label: "Sold",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

type SoldChartItem = {
  date: string;
  sold: number;
};

type ProductDetailChartProps = {
  productId: string;
  productName: string;
};

const daysMap: Record<TimeRange, number> = {
  "90d": 90,
  "30d": 30,
  "7d": 7,
};

export function ProductDetailChart({
  productId,
  productName,
}: ProductDetailChartProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState<TimeRange | null>(null);
  const [chartData, setChartData] = React.useState<SoldChartItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const selectedTimeRange = timeRange ?? (isMobile ? "7d" : "90d");

  React.useEffect(() => {
    async function loadChartData() {
      setIsLoading(true);
      setError(null);

      const days = daysMap[selectedTimeRange];

      try {
        const response = await getDashboardProductSales(days, productId);

        setChartData(
          (response.data ?? []).map((item) => ({
            date: item.date,
            sold: item.sold,
          })),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    loadChartData();
  }, [productId, selectedTimeRange]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{productName}</CardTitle>
            <CardDescription>
              Showing sales data for {productName} over the last{" "}
              {daysMap[selectedTimeRange]} days.
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
              <linearGradient id="fillSold" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-sold)"
                  stopOpacity={1}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-sold)"
                  stopOpacity={0.1}
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
              dataKey="sold"
              type="natural"
              fill="url(#fillSold)"
              stroke="var(--color-sold)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>

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
