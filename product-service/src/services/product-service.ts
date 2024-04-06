import { products } from "@functions/getProductsList/mocks";

export const getProductsList = async () => {
  return await products;
};

export const getProductById = async (id) => {
  return products.find((p) => p.id === id) || null;
};
