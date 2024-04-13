import type { AWS } from "@serverless/typescript";

import { importProductsFile, importFileParser } from "@functions";

const serverlessConfiguration: AWS = {
  service: "import-service",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild", "serverless-offline"],
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
      BMW_STORE_BUCKET_NAME:
        "${self:resources.Resources.bmwStoreS3Bucket.Properties.BucketName}",
    },
    httpApi: {
      cors: true,
    },
  },
  functions: {
    importProductsFile: {
      ...importProductsFile,
      name: "${sls:stage}-importProductsFile",
      role: "ImportProductsFileLambdaRole",
      events: [
        {
          httpApi: {
            method: "get",
            path: "/import",
          },
        },
      ],
    },
    importFileParser: {
      ...importFileParser,
      name: "${sls:stage}-importFileParser",
      role: "ImportFileParserLambdaRole",
      events: [
        {
          s3: {
            bucket: "bmw-store-bucket",
            event: "s3:ObjectCreated:*",
            rules: [{ prefix: "uploaded/" }],
            existing: true,
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
    "serverless-offline": {
      httpPort: 3001,
      printOutput: true,
    },
  },
  resources: {
    Resources: {
      bmwStoreS3Bucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "bmw-store-bucket",
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedOrigins: ["*"],
                AllowedHeaders: ["*"],
                AllowedMethods: ["GET", "PUT", "HEAD"],
              },
            ],
          },
        },
      },
      // ROLES
      ImportProductsFileLambdaRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          RoleName: "ImportProductsFileLambdaRole",
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
              PolicyName: "ImportProductsFileLambdaPolicy",
              PolicyDocument: {
                Version: "2012-10-17",
                Statement: [
                  {
                    Sid: "S3Access",
                    Effect: "Allow",
                    Action: ["s3:PutObject", "s3:ListBucket"],
                    Resource: "arn:aws:s3:::bmw-store-bucket/*",
                  },
                ],
              },
            },
            {
              PolicyName: "ImportProductsFileLambdaLogsPolicy",
              PolicyDocument: {
                Version: "2012-10-17",
                Statement: [
                  {
                    Effect: "Allow",
                    Action: [
                      "logs:CreateLogGroup",
                      "logs:CreateLogStream",
                      "logs:PutLogEvents",
                    ],
                    Resource: "arn:aws:logs:*:*:*",
                  },
                ],
              },
            },
          ],
        },
      },
      ImportFileParserLambdaRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          RoleName: "ImportFileParserLambdaRole",
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
              PolicyName: "ImportFileParserLambdaPolicy",
              PolicyDocument: {
                Version: "2012-10-17",
                Statement: [
                  {
                    Sid: "S3Access",
                    Effect: "Allow",
                    Action: [
                      "s3:GetObject",
                      "s3:DeleteObject",
                      "s3:CopyObject",
                    ],
                    Resource: "arn:aws:s3:::bmw-store-bucket/*",
                  },
                ],
              },
            },
            {
              PolicyName: "ImportFileParserLambdaLogsPolicy",
              PolicyDocument: {
                Version: "2012-10-17",
                Statement: [
                  {
                    Effect: "Allow",
                    Action: [
                      "logs:CreateLogGroup",
                      "logs:CreateLogStream",
                      "logs:PutLogEvents",
                    ],
                    Resource: "arn:aws:logs:*:*:*",
                  },
                ],
              },
            },
          ],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
