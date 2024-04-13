import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { products } from "@shared/mocks";

// CONSTANTS
const TABLE_NAME = "Product";
const REGION = "eu-central-1";

// Create a DocumentClient that represents the query to add an item
const client = new DynamoDBClient({
  region: REGION,
});

export async function seedProduct() {
  for (let product of products) {
    const command = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        id: {
          S: product.id,
        },
        title: {
          S: product.title,
        },
        description: {
          S: product.description,
        },
        price: {
          N: product.price.toString(),
        },
      },
    });

    try {
      const data = await client.send(command);
      console.log("Put item succeeded:", data);
    } catch (err) {
      console.error("Unable to put item:", JSON.stringify(err, null, 2));
    }
  }
}

seedProduct();
