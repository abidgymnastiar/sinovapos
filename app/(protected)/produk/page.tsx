import { CustomButton } from "@/app/_components/CustomButton";
import { getProducts } from "@/services/productService";
import { PlusIcon } from "lucide-react";

import { ProductTable } from "./table-core";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40];

type ProdukPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    limit?: string | string[];
  }>;
};

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getPositiveNumber(value: string | undefined, fallback: number) {
  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

function getAllowedLimit(value: string | undefined) {
  const limit = getPositiveNumber(value, 10);

  return PAGE_SIZE_OPTIONS.includes(limit) ? limit : 10;
}

export default async function ProdukPage({ searchParams }: ProdukPageProps) {
  const params = await searchParams;
  const page = getPositiveNumber(getSearchParamValue(params.page), 1);
  const limit = getAllowedLimit(getSearchParamValue(params.limit));
  const result = await getProducts(page, limit);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between gap-3 px-4 lg:px-6">
        <h1 className="text-lg font-semibold tracking-tight">Produk</h1>
        <CustomButton
          label="Tambah Produk"
          icon={<PlusIcon className="h-4 w-4" />}
          // onClick={() => console.log("Tambah Produk")}
        />
      </div>
      <div className="px-4 lg:px-6">
        <ProductTable
          data={result.data}
          meta={result.meta}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />
      </div>
    </div>
  );
}
