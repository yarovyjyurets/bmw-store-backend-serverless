import { getErrorResponse, getSuccessResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { v4 as uuidv4 } from "uuid";
import * as productServiceAPI from "@services/product-service";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

// create type of body
type Body = {
  title: string;
  description?: string;
  price: number;
  count?: number;
};

const buildHandler =
  ({ productService = productServiceAPI } = {}) =>
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const body = event.body as unknown as Body;

    // validate body
    if (
      !body ||
      !body.title ||
      !body.price ||
      isNaN(body.price) ||
      (body.count && isNaN(body.count))
    ) {
      return getErrorResponse({
        statusCode: 400,
        errorMessage: "Invalid request body",
      });
    }

    const newProduct = {
      id: uuidv4(),
      description: body.description || "UNKNOWN",
      price: body.price,
      title: body.title,
      count: body.count || 0,
    };

    try {
      const product = await productService.createProduct(newProduct);
      console.dir({ message: "????", product }, { colors: true, depth: 10 });
      return getSuccessResponse({ response: product });
    } catch (error) {
      return getErrorResponse({ errorMessage: error.message });
    }
  };

export const main = middyfy(buildHandler());
