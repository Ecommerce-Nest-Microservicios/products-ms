export interface IProduct {
  id: number;
  name: string;
  price: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductServiceResponse {
  ok: boolean;
  message: string;
  data: IProduct;
}
export interface IProductsServiceResponse {
  ok: boolean;
  message: string;
  data: IProduct[];
  count?: number;
  totalCount?: number;
  nextPage?: number | null;
  prevPage?: number | null;
  totalPages?: number | null;
}

export interface IProductServiceError {
  ok: boolean;
  message: string;
  error?: string;
  statusCode?: number;
}
