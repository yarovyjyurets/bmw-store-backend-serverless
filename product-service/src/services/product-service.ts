import { products } from "@functions/getProductsList/mocks";
import {
  DynamoDBClient,
  GetItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

// CONSTANTS
const TABLE_NAME_PRODUCT = process.env.TABLE_NAME_PRODUCT;
const TABLE_NAME_STOCK = process.env.TABLE_NAME_STOCK;
const dynamoDb = new DynamoDBClient();

const retrieveStockAndMerge = async (product) => {
  const command = new GetItemCommand({
    TableName: TABLE_NAME_STOCK,
    Key: {
      product_id: { S: product.id },
    },
  });

  const { Item } = await dynamoDb.send(command);
  if (Item) {
    const stock = unmarshall(Item);
    return { ...product, ...stock };
  }

  return product;
};

const retrieveStocksAndMerge = async (products) => {
  return Promise.all(products.map(retrieveStockAndMerge));
};

export const getProductsList = async () => {
  const command = new ScanCommand({
    TableName: TABLE_NAME_PRODUCT,
  });

  const { Items } = await dynamoDb.send(command);
  const products = Items.map((item) => unmarshall(item));
  const res = await retrieveStocksAndMerge(products);
  return res;
};

export const getProductById = async (id) => {
  const command = new GetItemCommand({
    TableName: TABLE_NAME_PRODUCT,
    Key: {
      id: { S: id },
    },
  });

  const { Item } = await dynamoDb.send(command);
  if (!Item) {
    return null;
  }

  return retrieveStockAndMerge(unmarshall(Item));
};
