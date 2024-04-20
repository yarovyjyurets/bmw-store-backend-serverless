import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSuccessResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const BMW_STORE_BUCKET_NAME = process.env.BMW_STORE_BUCKET_NAME;
const FOLDER_PREFIX = "uploaded";
const REGION = "eu-central-1";

const buildHandler =
  ({} = {}) =>
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const name = event.queryStringParameters?.name;
    if (!name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "[name] query parameter is required" }),
      };
    }

    const s3Client = new S3Client({ region: REGION });
    const command = new PutObjectCommand({
      Bucket: BMW_STORE_BUCKET_NAME,
      Key: `${FOLDER_PREFIX}/${name}`,
    });
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    console.log("Presigned URL: ", presignedUrl);

    return getSuccessResponse({ response: presignedUrl });
  };

export const main = middyfy(buildHandler());
