import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getReport } from "@/services/reportService";

import { ReportTable } from "./table-core";

type LaporanPageProps = {
  searchParams: Promise<{
    month?: string | string[];
  }>;
};

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getMonthParam(value: string | undefined) {
  return value && /^\d{4}-\d{2}$/.test(value) ? value : undefined;
}

export default async function LaporanPage({
  searchParams,
}: LaporanPageProps) {
  const params = await searchParams;
  const month = getMonthParam(getSearchParamValue(params.month));
  const report = await getReport(month);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <form className="flex items-end justify-end gap-2 px-4 lg:px-6">
        <div className="grid gap-2">
          <Label htmlFor="month">Bulan</Label>
          <Input
            id="month"
            name="month"
            type="month"
            defaultValue={report.meta.month}
            className="w-44"
          />
        </div>
        <Button type="submit" variant="outline" size="icon">
          <span className="sr-only">Tampilkan laporan</span>
          <SearchIcon />
        </Button>
      </form>
      <div className="px-4 lg:px-6">
        <ReportTable columns={report.meta.columns} data={report.data} />
      </div>
    </div>
  );
}
