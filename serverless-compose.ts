const serverlessCompose = {
  services: {
    authorizationService: {
      path: "authorization-service",
    },
    importService: {
      path: "import-service",
      params: {
        SQSQueueUrl: "${productService.SQSQueueUrl}",
        SQSQueueArn: "${productService.SQSQueueArn}",
        AuthFunctionArn: "${authorizationService.AuthFunctionArn}",
      },
    },
    productService: {
      path: "product-service",
    },
  },
};

module.exports = serverlessCompose;
