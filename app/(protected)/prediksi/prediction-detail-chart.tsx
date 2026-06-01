"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  CalendarDaysIcon,
  Loader2Icon,
  PackageSearchIcon,
  SearchIcon,
} from "lucide-react";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
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
import { getProducts, type Product } from "@/services/productService";
import {
  getPredictionDetail,
  type PredictionDetailData,
} from "@/services/predictionService";

import { predictionMonths } from "./prediction-constants";

const chartConfig = {
  predicted_sales: {
    label: "Prediksi",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

type PredictionChartItem = {
  date: string;
  predicted_sales: number;
};

type DetailFilter = {
  month: number;
  monthName: string;
  productId: string;
  productName: string;
  year: number;
};

function formatChartDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function formatMetric(value: number | null, suffix = "") {
  if (value === null || Number.isNaN(value)) {
    return "-";
  }

  return `${value.toLocaleString("id-ID", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}${suffix}`;
}

export function PredictionDetailChart() {
  const currentDate = new Date();
  const [month, setMonth] = React.useState(String(currentDate.getMonth() + 1));
  const [year, setYear] = React.useState(String(currentDate.getFullYear()));
  const [productId, setProductId] = React.useState("");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedFilter, setSelectedFilter] = React.useState<DetailFilter | null>(
    null,
  );
  const [predictionDetail, setPredictionDetail] =
    React.useState<PredictionDetailData | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadProducts() {
      setIsLoadingProducts(true);
      setError(null);

      try {
        const response = await getProducts(1, 100);
        const nextProducts = response.data ?? [];

        setProducts(nextProducts);
        setProductId((currentProductId) =>
          currentProductId || nextProducts.length === 0
            ? currentProductId
            : nextProducts[0].id,
        );
      } catch (err) {
        console.error("Product list fetch error", err);
        setError("Gagal memuat daftar produk.");
      } finally {
        setIsLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  async function handleLoadDetail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const selectedProduct = products.find((product) => product.id === productId);
    const parsedMonth = Number(month);
    const parsedYear = Number(year);

    if (!selectedProduct || !parsedMonth || !parsedYear) {
      return;
    }

    const nextFilter = {
      month: parsedMonth,
      monthName: predictionMonths[parsedMonth - 1],
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      year: parsedYear,
    };

    setSelectedFilter(nextFilter);
    setPredictionDetail(null);
    setError(null);
    setIsLoadingDetail(true);

    try {
      const detail = await getPredictionDetail({
        month: parsedMonth,
        productId: selectedProduct.id,
        year: parsedYear,
      });

      setPredictionDetail(detail);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat detail prediksi.",
      );
    } finally {
      setIsLoadingDetail(false);
    }
  }

  const hasMatchingDetail =
    selectedFilter &&
    predictionDetail &&
    predictionDetail.forecast_month === selectedFilter.month &&
    predictionDetail.forecast_year === selectedFilter.year &&
    String(predictionDetail.product.product_id) === selectedFilter.productId;
  const product = hasMatchingDetail ? predictionDetail.product : null;
  const chartData: PredictionChartItem[] =
    product?.predictions.map((prediction) => ({
      date: prediction.date,
      predicted_sales: prediction.predicted_sales,
    })) ?? [];

  return (
    <Card className="@container/card w-full">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <CardTitle>
            {selectedFilter ? selectedFilter.productName : "Detail Prediksi"}
          </CardTitle>
          <CardDescription>
            {selectedFilter
              ? `${selectedFilter.monthName} ${selectedFilter.year}`
              : "Baca hasil prediksi berdasarkan bulan, tahun, dan produk."}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="border-t pt-5">
        <form
          onSubmit={handleLoadDetail}
          className="grid gap-4 xl:grid-cols-[14rem_10rem_16rem_auto] xl:items-end"
        >
          <div className="grid gap-2">
            <Label htmlFor="detail-month">Bulan</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger id="detail-month" className="w-full">
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
            <Label htmlFor="detail-year">Tahun</Label>
            <Input
              id="detail-year"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              inputMode="numeric"
              max={2100}
              min={1900}
              type="number"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="detail-product">Nama Produk</Label>
            <Select
              value={productId}
              onValueChange={setProductId}
              disabled={isLoadingProducts || products.length === 0}
            >
              <SelectTrigger id="detail-product" className="w-full">
                <PackageSearchIcon />
                <SelectValue
                  placeholder={
                    isLoadingProducts ? "Memuat produk" : "Pilih produk"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {products.map((productItem) => (
                  <SelectItem key={productItem.id} value={productItem.id}>
                    {productItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full xl:w-fit"
            disabled={!productId || isLoadingProducts || isLoadingDetail}
          >
            {isLoadingDetail ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <SearchIcon />
            )}
            {isLoadingDetail ? "Memuat..." : "Tampilkan Detail"}
          </Button>
        </form>

        {product ? (
          <div className="mt-5 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            <div className="rounded-md border px-3 py-2">
              <p className="text-xs text-muted-foreground">Alpha</p>
              <p className="font-medium">{formatMetric(product.alpha)}</p>
            </div>
            <div className="rounded-md border px-3 py-2">
              <p className="text-xs text-muted-foreground">Beta</p>
              <p className="font-medium">{formatMetric(product.beta)}</p>
            </div>
            <div className="rounded-md border px-3 py-2">
              <p className="text-xs text-muted-foreground">Akurasi</p>
              <p className="font-medium">
                {formatMetric(product.accuracy, "%")}
              </p>
            </div>
            <div className="rounded-md border px-3 py-2">
              <p className="text-xs text-muted-foreground">MAPE</p>
              <p className="font-medium">{formatMetric(product.mape, "%")}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-5 px-0 sm:px-2">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="fillPredictionSales"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-predicted_sales)"
                    stopOpacity={1}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-predicted_sales)"
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
                tickFormatter={formatChartDate}
              />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(value) => formatChartDate(String(value))}
                  />
                }
              />

              <Area
                dataKey="predicted_sales"
                type="natural"
                fill="url(#fillPredictionSales)"
                stroke="var(--color-predicted_sales)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </div>

        {error ? (
          <div className="mt-4 text-center text-sm text-destructive">
            {error}
          </div>
        ) : !selectedFilter ? (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Detail prediksi belum dipilih.
          </div>
        ) : isLoadingDetail ? (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Memuat detail prediksi...
          </div>
        ) : !product ? (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Produk tidak ditemukan pada detail prediksi.
          </div>
        ) : chartData.length === 0 ? (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Data prediksi belum tersedia.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
