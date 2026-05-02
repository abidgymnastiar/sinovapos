"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ChartFilter } from "@/app/_components/line-chart/chart-filter";
import type { TimeRange } from "@/app/_components/line-chart/chart-types";

const chartConfig = {
  sold: {
    label: "Sold",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

type Product = {
  id: number;
  name: string;
};

type SoldChartItem = {
  date: string;
  sold: number;
};

const daysMap: Record<TimeRange, number> = {
  "90d": 90,
  "30d": 30,
  "7d": 7,
};

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState<TimeRange | null>(null);
  const [selectedProductId, setSelectedProductId] = React.useState<string>("all");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [chartData, setChartData] = React.useState<SoldChartItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const selectedTimeRange = timeRange ?? (isMobile ? "7d" : "90d");
  const selectedProduct =
    products.find((product) => String(product.id) === selectedProductId) ??
    { id: 0, name: "All products" };

  React.useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products?page=1&limit=100");
        const json = await response.json();

        if (json?.success) {
          setProducts(json.data ?? []);
        } else {
          console.error("Failed to load product list", json);
        }
      } catch (err) {
        console.error("Product list fetch error", err);
      }
    }

    loadProducts();
  }, []);

  React.useEffect(() => {
    async function loadChartData() {
      setIsLoading(true);
      setError(null);

      const days = daysMap[selectedTimeRange];
      const productIdQuery =
        selectedProductId === "all" ? "" : `&productId=${selectedProductId}`;

      try {
        const response = await fetch(
          `/api/dashboard/product?days=${days}${productIdQuery}`,
        );
        const json = await response.json();

        if (!json?.success) {
          throw new Error(json?.message ?? "Failed to load chart data");
        }

        setChartData(
          (json.data ?? []).map((item: { date: string; sold: number }) => ({
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
  }, [selectedTimeRange, selectedProductId]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>
              {selectedProductId === "all"
                ? "All products"
                : selectedProduct.name}
            </CardTitle>
            <CardDescription>
              Showing sales data for {selectedProduct.name} over the last {daysMap[selectedTimeRange]} days.
            </CardDescription>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <ChartFilter value={selectedTimeRange} onChange={setTimeRange} />

            <Select
              value={selectedProductId}
              onValueChange={(value) => setSelectedProductId(value)}
            >
              <SelectTrigger
                size="sm"
                className="w-48"
                aria-label="Select product"
              >
                <SelectValue placeholder="All products" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All products</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={String(product.id)}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <stop offset="5%" stopColor="var(--color-sold)" stopOpacity={1} />
                <stop offset="95%" stopColor="var(--color-sold)" stopOpacity={0.1} />
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
                new Date(value).toLocaleDateString("en-US", {
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
                    new Date(value).toLocaleDateString("en-US", {
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
            No sales data available for the selected product and period.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
