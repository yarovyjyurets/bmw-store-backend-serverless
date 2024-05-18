import type { AWS } from "@serverless/typescript";

import {
  getProductsList,
  getProductsById,
  postProduct,
  catalogBatchProcess,
} from "@functions";

const serverlessConfiguration: AWS = {
  service: "product-service",
  frameworkVersion: "3",
  plugins: [
    "serverless-dynamodb-local",
    "serverless-auto-swagger",
    "serverless-esbuild",
    "serverless-offline",
  ],
  provider: {
    profile: "yurets",
    name: "aws",
    runtime: "nodejs20.x",
    stage: "dev",
    region: "eu-central-1",
    memorySize: 512,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      TABLE_NAME_PRODUCT: "${self:custom.productTableName}",
      TABLE_NAME_STOCK: "${self:custom.stockTableName}",
      SNS_TOPIC_ARN: { Ref: "createProductTopic" },
    },
    httpApi: {
      cors: true,
    },
  },
  // import the function via paths
  functions: {
    getProductsList: {
      ...getProductsList,
      name: "${sls:stage}-getProductsList",
      role: "GetProductsLambdaRole",
      events: [
        {
          httpApi: {
            method: "GET",
            path: "/${sls:stage}/products",
          },
        },
      ],
    },
    getProductsById: {
      ...getProductsById,
      name: "${sls:stage}-getProductsById",
      role: "GetProductByIdLambdaRole",
      events: [
        {
          httpApi: {
            method: "GET",
            path: "/${sls:stage}/products/{productId}",
          },
        },
      ],
    },
    postProduct: {
      ...postProduct,
      name: "${sls:stage}-postProduct",
      role: "PostProductLambdaRole",
      events: [
        {
          httpApi: {
            method: "POST",
            path: "/${sls:stage}/products",
          },
        },
      ],
    },
    catalogBatchProcess: {
      ...catalogBatchProcess,
      name: "${sls:stage}-catalogBatchProcess",
      role: "CatalogBatchProcessLambdaRole",
      events: [
        {
          sqs: {
            arn: {
              "Fn::GetAtt": ["catalogItemsQueue", "Arn"],
            },
            batchSize: 5,
          },
        },
      ],
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    productTableName: "Product",
    stockTableName: "Stock",
    dynamodb: {
      stages: ["dev"],
      start: {
        docker: true,
        port: 8000,
        inMemory: true,
        migrate: true,
        seed: true,
        convertEmptyValues: true,
      },
      seed: {
        domain: {
          sources: [
            {
              table: "self:custom.productTableName",
              sources: ["./seed/Products.json"],
            },
            {
              table: "self:custom.stockTableName",
              sources: ["./seed/Stocks.json"],
            },
          ],
        },
      },
    },
  },
  resources: {
    Resources: {
      // QUEUEs
      catalogItemsQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "catalogItemsQueue",
        },
      },
      // SNStopic
      createProductTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName: "createProductTopic",
        },
      },
      createProductTopicSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Protocol: "email",
          TopicArn: {
            Ref: "createProductTopic",
          },
          Endpoint: "yurii_yarovyi@epam.com",
        },
      },
      // IAM role for Lambda functions
      GetProductsLambdaRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          RoleName: "GetProductsLambda-${sls:stage}",
          AssumeRolePolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: {
                  Service: "lambda.amazonaws.com",
                },
                Action: "sts:AssumeRole",
              },
            ],
          },
          Policies: [
            {
              PolicyName: "DynamoDBGetProductsPolicy",
              PolicyDocument: {
                Version: "2012-10-17",
                Statement: [
                  {
                    Sid: "DynamoDBGetProductsPolicy",
                    Effect: "Allow",
                    Action: ["dynamodb:Scan", "dynamodb:GetItem"],
                    Resource: [
                      "arn:aws:dynamodb:${self:provider.region}:*:table/${self:custom.productTableName}",
                      "arn:aws:dynamodb:${self:provider.region}:*:table/${self:custom.stockTableName}",
                    ],
                  },
                ],
              },
            },
          ],
        },
      },
      GetProductByIdLambdaRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          RoleName: "GetProductByIdLambda-${sls:stage}",
          AssumeRolePolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: {
                  Service: "lambda.amazonaws.com",
                },
                Action: "sts:AssumeRole",
              },
            ],
          },
          Policies: [
            {
              PolicyName: "DynamoDBGetProductsPolicy",
              PolicyDocument: {
                Version: "2012-10-17",
                Statement: [
                  {
                    Sid: "DynamoDBGetProductsPolicy",
                    Effect: "Allow",
                    Action: ["dynamodb:Scan", "dynamodb:GetItem"],
                    Resource: [
                      "arn:aws:dynamodb:${self:provider.region}:*:table/${self:custom.productTableName}",
                      "arn:aws:dynamodb:${self:provider.region}:*:table/${self:custom.stockTableName}",
                    ],
                  },
                ],
              },
            },
          ],
        },
      },
      PostProductLambdaRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          RoleName: "PostProductLambda-${sls:stage}",
          AssumeRolePolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: {
                  Service: "lambda.amazonaws.com",
                },
                Action: "sts:AssumeRole",
              },
            ],
          },
          Policies: [
            {
              PolicyName: "DynamoDBGetProductsPolicy",
              PolicyDocument: {
                Version: "2012-10-17",
                Statement: [
                  {
                    Sid: "DynamoDBGetProductsPolicy",
                    Effect: "Allow",
                    Action: ["dynamodb:CreateItem", "dynamodb:PutItem"],
                    Resource: [
                      "arn:aws:dynamodb:${self:provider.region}:*:table/${self:custom.productTableName}",
                      "arn:aws:dynamodb:${self:provider.region}:*:table/${self:custom.stockTableName}",
                    ],
                  },
                ],
              },
            },
          ],
        },
      },
      CatalogBatchProcessLambdaRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          RoleName: "CatalogBatchProcessLambda-${sls:stage}",
          ManagedPolicyArns: [
            "arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole",
          ],
          AssumeRolePolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: {
                  Service: "lambda.amazonaws.com",
                },
                Action: "sts:AssumeRole",
              },
            ],
          },
          Policies: [
            {
              PolicyName: "DynamoDBGetProductsPolicy",
              PolicyDocument: {
                Version: "2012-10-17",
                Statement: [
                  {
                    Sid: "DynamoDBGetProductsPolicy",
                    Effect: "Allow",
                    Action: ["dynamodb:CreateItem", "dynamodb:PutItem"],
                    Resource: [
                      "arn:aws:dynamodb:${self:provider.region}:*:table/${self:custom.productTableName}",
                      "arn:aws:dynamodb:${self:provider.region}:*:table/${self:custom.stockTableName}",
                    ],
                  },
                ],
              },
            },
            {
              PolicyName: "SNSPublishPolicy",
              PolicyDocument: {
                Version: "2012-10-17",
                Statement: [
                  {
                    Sid: "SNSPublishPolicy",
                    Effect: "Allow",
                    Action: ["sns:Publish"],
                    Resource: { Ref: "createProductTopic" },
                  },
                ],
              },
            },
          ],
        },
      },
      // DynamoDB tables
      ProductTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "Product",
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
          ],
          BillingMode: "PAY_PER_REQUEST",
        },
      },
      StockTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "Stock",
          AttributeDefinitions: [
            {
              AttributeName: "product_id",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "product_id",
              KeyType: "HASH",
            },
          ],
          BillingMode: "PAY_PER_REQUEST",
        },
      },
    },
    Outputs: {
      SQSQueueUrl: {
        Value: {
          Ref: "catalogItemsQueue",
        },
      },
      SQSQueueArn: {
        Value: { "Fn::GetAtt": ["catalogItemsQueue", "Arn"] },
      },
    },
  },
};

module.exports = serverlessConfiguration;
