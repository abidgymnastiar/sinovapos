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

export type DashboardProductSalesItem = {
  date: string;
  product_id: number;
  product_name: string;
  sold: number;
};

export type DashboardProductSalesResponse = {
  success: boolean;
  data: DashboardProductSalesItem[];
};

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const res = await api.get("/dashboard");

  return res.data;
};

export const getDashboardProductSales = async (
  days: number,
  productId?: string,
): Promise<DashboardProductSalesResponse> => {
  const res = await api.get<DashboardProductSalesResponse>("/dashboard/product", {
    params: {
      days,
      productId,
    },
  });

  return res.data;
};
