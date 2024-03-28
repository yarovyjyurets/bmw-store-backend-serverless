import { getSuccessResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import * as productServiceAPI from "@services/product-service";
import { APIGatewayProxyResult } from "aws-lambda";

const buildHandler =
  ({ productService = productServiceAPI } = {}) =>
  async (): Promise<APIGatewayProxyResult> => {
    const products = await productService.getProductsList();
    return getSuccessResponse({ response: products });
  };

export const main = middyfy(buildHandler());
