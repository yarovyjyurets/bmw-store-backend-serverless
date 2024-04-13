import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { products } from "@shared/mocks";
import { marshall } from "@aws-sdk/util-dynamodb";

// CONSTANTS
const TABLE_NAME = "Stock";
const REGION = "eu-central-1";

// Configure AWS region
const dynamoDb = new DynamoDBClient({ region: REGION });
export async function seedStock() {
  for (let product of products) {
    const item = {
      product_id: product.id,
      count: product.count,
    };

    const params = {
      TableName: TABLE_NAME,
      Item: marshall(item),
    };

    const command = new PutItemCommand(params);

    try {
      const data = await dynamoDb.send(command);
      console.log("Put item succeeded:", data);
    } catch (err) {
      console.error("Unable to put item:", JSON.stringify(err, null, 2));
    }
  }
}

seedStock();
