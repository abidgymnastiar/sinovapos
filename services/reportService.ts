import { api } from "@/lib/axios";

export type ReportColumn = {
  date?: string;
  day?: string;
  is_tanggal_merah?: boolean;
  is_weekend?: boolean;
  key: string;
  label: string;
};

export type ExcludedReportDate = Required<
  Pick<ReportColumn, "date" | "day" | "is_tanggal_merah" | "is_weekend">
> &
  Pick<ReportColumn, "key" | "label"> & {
    reason: string | null;
  };

export type ReportRow = {
  nama_produk: string;
  no: number;
  product_id: string;
  total_sold: number;
  [key: string]: string | number;
};

export type ReportResponse = {
  success: boolean;
  data: ReportRow[];
  meta: {
    columns: ReportColumn[];
    excluded_dates: ExcludedReportDate[];
    include_tanggal_merah: boolean;
    include_weekend: boolean;
    month: string;
    month_end: string;
    month_start: string;
  };
};

export const getReport = async (month?: string): Promise<ReportResponse> => {
  const res = await api.get("/laporan", {
    params: month ? { month } : undefined,
  });

  return res.data;
};
