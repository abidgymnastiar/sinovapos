import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";
import { isAxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { getProductById } from "@/services/productService";

import { ProductDetailChart } from "./product-detail-chart";
import { ProductStockTable } from "./table-core";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getProductDetail(id: string) {
  try {
    return await getProductById(id);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      notFound();
    }

    throw error;
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const result = await getProductDetail(id);
  const product = result.data;

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <Button asChild variant="outline" className="w-fit">
          <Link href="/produk">
            <ChevronLeftIcon />
            Kembali
          </Link>
        </Button>

        <div className="grid gap-3 border-b pb-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Nama Produk</p>
            <p className="font-medium">{product.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ID Produk</p>
            <p className="font-medium">{product.id}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Data</p>
            <p className="font-medium">{result.meta.totalStocks}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Diperbarui</p>
            <p className="font-medium">{formatDate(product.updated_at)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <ProductDetailChart productId={product.id} productName={product.name} />
      </div>

      <div className="px-4 lg:px-6">
        <ProductStockTable data={product.stocks} />
      </div>
    </div>
  );
}
