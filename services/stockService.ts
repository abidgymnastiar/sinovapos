import { api } from "@/lib/axios";
import type { Product } from "@/services/productService";

export type Stock = {
  id: string;
  product_id: string;
  date: string;
  opening_stock: number;
  closing_stock: number | null;
  sold: number;
  created_at: string | null;
  updated_at: string | null;
  product: Product;
};

// GET ALL STOCKS
export const getStocks = async (): Promise<Stock[]> => {
  const res = await api.get("/stocks");

  return res.data;
};
