const serverlessCompose = {
  services: {
    importService: {
      path: "import-service",
      params: {
        SQSQueueUrl: "${productService.SQSQueueUrl}",
        SQSQueueArn: "${productService.SQSQueueArn}",
      },
    },
    productService: {
      path: "product-service",
    },
  },
};

module.exports = serverlessCompose;
