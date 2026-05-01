import { api } from "@/lib/axios";

export type Product = {
  id: string;
  name: string;
  image: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ProductStock = {
  id: string;
  product_id: string;
  date: string;
  opening_stock: number;
  closing_stock: number | null;
  sold: number;
  created_at: string | null;
  updated_at: string | null;
};

export type ProductDetail = Product & {
  stocks: ProductStock[];
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

export type ProductDetailResponse = {
  success: boolean;
  data: ProductDetail;
  meta: {
    totalStocks: number;
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

// GET PRODUCT DETAIL
export const getProductById = async (
  id: string,
): Promise<ProductDetailResponse> => {
  const res = await api.get(`/products/${id}`);

  return res.data;
};
