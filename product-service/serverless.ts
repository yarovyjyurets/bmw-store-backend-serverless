import type { AWS } from "@serverless/typescript";

import { getProductsList, getProductsById } from "@functions";

const serverlessConfiguration: AWS = {
  service: "product-service",
  frameworkVersion: "3",
  plugins: [
    "serverless-auto-swagger",
    "serverless-esbuild",
    "serverless-offline",
  ],
  provider: {
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
      events: [
        {
          httpApi: {
            method: "GET",
            path: "/${sls:stage}/products/{productId}",
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
  },
};

module.exports = serverlessConfiguration;
