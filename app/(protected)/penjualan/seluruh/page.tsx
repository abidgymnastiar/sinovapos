import { getAllProducts } from "@/services/productService";
import { getStocks } from "@/services/stockService";

import { StockModalForm } from "../modal-form";
import { AllSalesTable } from "./table-core";

export default async function SeluruhPage() {
  const [stocks, products] = await Promise.all([
    getStocks(),
    getAllProducts(),
  ]);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-end justify-end gap-3 px-4 lg:px-6">
        <StockModalForm
          dateMode="custom"
          products={products}
          title="Tambah Penjualan"
          description="Simpan data penjualan produk untuk tanggal yang dipilih."
        />
      </div>
      <div className="px-4 lg:px-6">
        <AllSalesTable data={stocks} products={products} />
      </div>
    </div>
  );
}
