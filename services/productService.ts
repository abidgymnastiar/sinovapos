import { api } from "@/lib/axios";

export type Product = {
  id: string;
  name: string;
  image: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ProductResponse = {
  success: boolean;
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// GET ALL PRODUCTS
export const getProducts = async (
  page = 1,
  limit = 10,
): Promise<ProductResponse> => {
  const res = await api.get("/products", {
    params: { page, limit },
  });

  return res.data;
};
