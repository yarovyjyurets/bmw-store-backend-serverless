import { getErrorResponse, getSuccessResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import * as productServiceAPI from "@services/product-service";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const buildHandler =
  ({ productService = productServiceAPI } = {}) =>
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const productId = event.pathParameters?.productId;
    console.log(event);
    console.log(productId);
    const product = await productService.getProductById(productId);
    if (!product) {
      return getErrorResponse({
        statusCode: 404,
        errorMessage: "Product Not Found",
      });
    }
    return getSuccessResponse({ response: product });
  };

export const main = middyfy(buildHandler());
