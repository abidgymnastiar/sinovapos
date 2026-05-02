import { api } from "@/lib/axios";

export type DashboardBestProduct = {
  id: string;
  name: string;
  image: string | null;
  created_at: string | null;
  updated_at: string | null;
  total_sold: number;
};

export type DashboardSummary = {
  total_produk: number;
  total_penjualan: number;
  produk_terlaris: DashboardBestProduct | null;
};

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const res = await api.get("/dashboard");

  return res.data;
};
