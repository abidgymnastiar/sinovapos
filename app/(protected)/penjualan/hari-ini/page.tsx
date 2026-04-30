import { getStocks, type Stock } from "@/services/stockService";

import { StockTodayTable } from "./table-core";

const JAKARTA_TIME_ZONE = "Asia/Jakarta";

function getDateKey(value: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
  }).formatToParts(value);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return year && month && day ? `${year}-${month}-${day}` : "";
}

function isTodayStock(stock: Stock) {
  return getDateKey(new Date(stock.date)) === getDateKey(new Date());
}

export default async function HariIniPage() {
  const stocks = await getStocks();
  const todayStocks = stocks.filter(isTodayStock);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <StockTodayTable data={todayStocks} />
      </div>
    </div>
  );
}
