import { DataTable } from "@/app/_layouts/data-table";
import { getDashboardSummary } from "@/services/dashboardService";

import data from "./data.json";
import { SectionCards } from "./section-cards";
import { ChartAreaInteractive } from "./section-line-chart";

export default async function Page() {
  const dashboardSummary = await getDashboardSummary();

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards data={dashboardSummary} />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive/>
      </div>
      <DataTable data={data} />
    </div>
  );
}
