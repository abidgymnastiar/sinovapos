import { getStocks } from "@/services/stockService";

import { AllSalesTable } from "./table-core";

export default async function SeluruhPage() {
  const stocks = await getStocks();

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <AllSalesTable data={stocks} />
      </div>
    </div>
  );
}
