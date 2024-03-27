import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  name: "${sls:stage}-lambdaName",
  events: [
    {
      httpApi: {
        method: "GET",
        path: "/hello",
      },
    },
  ],
};
