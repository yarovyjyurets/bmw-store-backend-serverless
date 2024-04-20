import { SQSEvent } from "aws-lambda";
import * as productServiceAPI from "@services/product-service";
import { Product } from "@shared/types";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { v4 as uuidv4 } from "uuid";

const REGION = "eu-central-1";
const topicArn = process.env.SNS_TOPIC_ARN as string;
const snsClient = new SNSClient({ region: REGION });

export const main = (
  ({ productService = productServiceAPI } = {}) =>
  async (event: SQSEvent): Promise<void> => {
    try {
      const createProductRequests = event.Records.map(async (record) => {
        console.log("Record:", JSON.stringify(record, null, 2));
        const product = JSON.parse(record.body) as Product;
        product.id = product.id || uuidv4();
        await productService.createProduct(product);
        return product;
      });

      const createdProducts = await Promise.all(createProductRequests);

      const message = `All products:
${createdProducts.map((p) => `${p.id}\n`)}
created!
     `;

      const publishCommand = new PublishCommand({
        TopicArn: topicArn,
        Message: message,
      });

      await snsClient.send(publishCommand);

      console.log(`All products ${event.Records.length} count created`);
    } catch (error) {
      console.error("Error:", error);
    }
  }
)();
