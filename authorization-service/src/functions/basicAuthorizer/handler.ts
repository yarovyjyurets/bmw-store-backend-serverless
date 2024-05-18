import { APIGatewayIAMAuthorizerResult, APIGatewayRequestIAMAuthorizerHandlerV2 } from "aws-lambda";

export const main: APIGatewayRequestIAMAuthorizerHandlerV2 = (event, _, callback) => {
  if (event.type !== 'REQUEST') {
    callback('Unauthorized');
  }

  try {
    const encodedCreds = event.headers.authorization.split(' ')[1];
    const plainCreds = Buffer.from(encodedCreds, 'base64').toString().split(':');

    const username = plainCreds[0];
    const password = plainCreds[1];
  
    console.log(`Username: ${username}; Password: ${password}`);
  
    const storedUserPassword = process.env[username];
    const effect = !storedUserPassword || storedUserPassword !== password ? 'Deny' : 'Allow';

    const policy = generatePolicy(encodedCreds, effect, event.routeArn);
  
    console.log(`Policy: ${JSON.stringify(policy)}`);

    callback(null, policy);
  } catch (error) {
    callback(`Unauthorized: ${error.message}`);
  }
};

const generatePolicy = (principalId: string, effect: 'Allow' | 'Deny', resource: string): APIGatewayIAMAuthorizerResult => ({
  principalId: principalId,
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource,
      },
    ],
  },
});