import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, "body"> & {
  body: FromSchema<S>;
};
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<
  ValidatedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>;

export const formatJSONResponse = <T>(
  statusCode,
  response: T
): APIGatewayProxyResult => {
  return {
    statusCode,
    body: JSON.stringify(response),
  };
};

export const getSuccessResponse = <T>({
  response,
  statusCode = 200,
}: {
  response: T;
  statusCode?: number;
}): APIGatewayProxyResult => {
  return formatJSONResponse(statusCode, response);
};

export const getErrorResponse = ({
  errorMessage = "Internal Server Error",
  statusCode = 500,
} = {}): APIGatewayProxyResult => {
  const response = {
    status: "failed",
    error: errorMessage,
  };

  return formatJSONResponse(statusCode, response);
};
